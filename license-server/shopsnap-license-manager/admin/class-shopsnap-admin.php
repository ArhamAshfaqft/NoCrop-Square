<?php

class ShopSnap_Admin {

	private $plugin_name;
	private $version;
	private $table_licenses;
	private $table_products;

	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version = $version;
		global $wpdb;
		$this->table_licenses = $wpdb->prefix . 'shopsnap_licenses';
		$this->table_products = $wpdb->prefix . 'shopsnap_products';
	}

	public function add_plugin_admin_menu() {
		add_menu_page(
			'ShopSnap Nexus', 
			'Nexus Manager', 
			'manage_options', 
			'shopsnap-nexus', 
			array( $this, 'display_dashboard_page' ), 
			'dashicons-networking', 
			6
		);
		
		add_submenu_page(
			'shopsnap-nexus',
			'Products',
			'Products',
			'manage_options',
			'shopsnap-nexus-products',
			array($this, 'display_products_page')
		);
	}

	public function display_dashboard_page() {
		global $wpdb;
		
		// Ensure DB is self-healed
		$this->self_heal_db();

		// Fetch Products for Dropdown
		$products = $wpdb->get_results("SELECT * FROM $this->table_products");

		// Filter by Product (Scope)
		$filter_pid = isset($_GET['pid']) ? intval($_GET['pid']) : 0;
		$view = isset($_GET['view']) ? sanitize_text_field($_GET['view']) : 'all';
		
		$where = "WHERE 1=1";
		if ($filter_pid > 0) $where .= " AND product_id = $filter_pid";
		
		// Status Views
		switch($view) {
			case 'claimed':
				$where .= " AND status = 'active' AND device_id IS NOT NULL AND device_id != ''";
				break;
			case 'unclaimed':
				$where .= " AND status = 'active' AND (device_id IS NULL OR device_id = '')";
				break;
			case 'revoked':
				$where .= " AND status = 'revoked'";
				break;
		}

		// Search Logic
		$search = isset($_GET['s']) ? sanitize_text_field($_GET['s']) : '';
		if ($search) {
			$where .= " AND (license_key LIKE '%$search%' OR customer_email LIKE '%$search%' OR device_id LIKE '%$search%')";
		}

		$total = $wpdb->get_var("SELECT COUNT(*) FROM $this->table_licenses");
		$active = $wpdb->get_var("SELECT COUNT(*) FROM $this->table_licenses WHERE status = 'active'");
		
		// Pagination
		$per_page = 50;
		$paged = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
		$offset = ($paged - 1) * $per_page;
		
		$total_items = $wpdb->get_var("SELECT COUNT(*) FROM $this->table_licenses $where");
		$total_pages = ceil($total_items / $per_page);

		// Join to get Product Name
		$query = "SELECT l.*, p.name as product_name FROM $this->table_licenses l LEFT JOIN $this->table_products p ON l.product_id = p.id $where ORDER BY l.created_at DESC LIMIT $offset, $per_page";
		$results = $wpdb->get_results($query);

		require_once SHOPSNAP_PLUGIN_DIR . 'admin/partials/shopsnap-admin-dashboard.php';
	}
	
	public function ajax_bulk_action() {
		check_ajax_referer( 'shopsnap_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );
		
		global $wpdb;
		$ids = isset($_POST['ids']) ? array_map('intval', $_POST['ids']) : [];
		$action = sanitize_text_field($_POST['todo']);
		
		if (empty($ids)) wp_send_json_error('No items selected');
		
		$ids_sql = implode(',', $ids);
		
		if ($action === 'revoke') {
			$wpdb->query("UPDATE $this->table_licenses SET status = 'revoked' WHERE id IN ($ids_sql)");
		} elseif ($action === 'delete') {
			$wpdb->query("DELETE FROM $this->table_licenses WHERE id IN ($ids_sql)");
		}
		
		wp_send_json_success();
	}

	public function display_products_page() {
		global $wpdb;

		// FORCE CREATE TABLE (Nuclear Option)
		$charset_collate = $wpdb->get_charset_collate();
		$sql_products = "CREATE TABLE IF NOT EXISTS $this->table_products (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			name varchar(100) NOT NULL,
			slug varchar(50) NOT NULL,
			secret_key varchar(100) DEFAULT NULL,
			latest_version varchar(20) DEFAULT '1.0.0',
			download_url text DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug)
		) $charset_collate;";
		$wpdb->query($sql_products);
		
		// Handle Add/Edit Form
		if (isset($_POST['shopsnap_save_product'])) {
			check_admin_referer('shopsnap_product_nonce');
			$name = sanitize_text_field($_POST['name']);
			$slug = sanitize_text_field($_POST['slug']);
			$ver  = sanitize_text_field($_POST['version']);
			$url  = esc_url_raw($_POST['url']);
			$id   = isset($_POST['id']) ? intval($_POST['id']) : 0;

			if ($id > 0) {
				$wpdb->update($this->table_products, array('name'=>$name, 'slug'=>$slug, 'latest_version'=>$ver, 'download_url'=>$url), array('id'=>$id));
			} else {
				$res = $wpdb->insert($this->table_products, array('name'=>$name, 'slug'=>$slug, 'latest_version'=>$ver, 'download_url'=>$url));
				if ($res === false) {
					echo '<div class="notice notice-error"><p>Error saving product: ' . esc_html($wpdb->last_error) . '</p></div>';
				} else {
					echo '<div class="notice notice-success"><p>Product saved!</p></div>';
				}
			}
		}

		$products = $wpdb->get_results("SELECT * FROM $this->table_products");
		require_once SHOPSNAP_PLUGIN_DIR . 'admin/partials/shopsnap-admin-products.php';
	}

	/**
	 * AJAX Handler: Generate Keys
	 */
	public function ajax_generate_keys() {
		check_ajax_referer( 'shopsnap_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		global $wpdb;
		$pid = intval( $_POST['product_id'] );
		$prefix = sanitize_text_field( $_POST['prefix'] );
		
		// Batches: [{limit: 1, amount: 50}, {limit: 5, amount: 50}]
		$batches = isset($_POST['batches']) ? $_POST['batches'] : [];
		
		// Fallback for legacy single generation
		if (empty($batches) && isset($_POST['amount'])) {
			$batches = array(
				array(
					'amount' => intval($_POST['amount']),
					'limit'  => isset($_POST['activation_limit']) ? intval($_POST['activation_limit']) : 1
				)
			);
		}

		$generated_keys = [];
		$generated_ids = [];
		$this->self_heal_db();

		foreach ($batches as $batch) {
			$amount = intval($batch['amount']);
			$limit  = intval($batch['limit']);
			$tier   = isset($batch['name']) ? sanitize_text_field($batch['name']) : '';
			
			if ($limit < 1) $limit = 1;
			if ($amount < 1) continue;
			if ($amount > 2000) $amount = 2000;

			for ( $i = 0; $i < $amount; $i++ ) {
				$key = $this->generate_license_key( $prefix );
				
				// Use Tier Name as source (truncated to 20 chars) or default
				$source = $tier ? substr($tier, 0, 20) : 'admin_gen';

				$res = $wpdb->insert(
					$this->table_licenses,
					array(
						'product_id'  => $pid,
						'license_key' => $key,
						'status'      => 'active',
						'activation_limit' => $limit,
						'source'      => $source
					)
				);
				if ( $res ) {
					// Store for CSV
					$generated_keys[] = array(
						'key' => $key,
						'limit' => $limit,
						'tier' => $tier // Pass full name back
					);
					$generated_ids[] = $wpdb->insert_id;
				}
			}
		}
		
		if (count($generated_ids) > 0) {
			// Fetch full details for the frontend table
			$ids_placeholder = implode(',', array_fill(0, count($generated_ids), '%d'));
			$new_rows = $wpdb->get_results($wpdb->prepare(
				"SELECT l.*, p.name as product_name FROM $this->table_licenses l LEFT JOIN $this->table_products p ON l.product_id = p.id WHERE l.id IN ($ids_placeholder) ORDER BY l.id DESC",
				$generated_ids
			));

			wp_send_json_success( array( 
				'message' => "Successfully generated " . count($generated_keys) . " keys.",
				'keys' => $generated_keys, // Now array of objects {key, limit}
				'rows' => $new_rows
			) );
		} else {
			wp_send_json_error( "Failed to generate keys. DB Error: " . $wpdb->last_error );
		}
	}

	public function ajax_revoke_key() {
		check_ajax_referer( 'shopsnap_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );
		global $wpdb;
		$id = intval($_POST['id']);
		$wpdb->update($this->table_licenses, array('status' => 'revoked'), array('id' => $id));
		wp_send_json_success();
	}

	public function ajax_delete_key() {
		check_ajax_referer( 'shopsnap_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );
		global $wpdb;
		$id = intval($_POST['id']);
		$wpdb->delete($this->table_licenses, array('id' => $id));
		wp_send_json_success();
	}
	
	private function self_heal_db() {
		global $wpdb;
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		$charset_collate = $wpdb->get_charset_collate();

		// 1. Ensure Table Exists
		if ($wpdb->get_var("SHOW TABLES LIKE '$this->table_licenses'") != $this->table_licenses) {
			$sql = "CREATE TABLE $this->table_licenses (
				id mediumint(9) NOT NULL AUTO_INCREMENT,
				product_id mediumint(9) NOT NULL DEFAULT 1,
				license_key varchar(50) NOT NULL UNIQUE,
				status varchar(20) DEFAULT 'active' NOT NULL,
				activation_date datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
				expiration_date datetime DEFAULT NULL,
				device_id varchar(100) DEFAULT NULL,
				activations longtext DEFAULT NULL,
				activation_limit int(9) DEFAULT 1 NOT NULL,
				customer_email varchar(100) DEFAULT NULL,
				source varchar(20) DEFAULT 'manual' NOT NULL,
				created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
				PRIMARY KEY  (id),
				KEY license_key (license_key),
				KEY product_id (product_id)
			) $charset_collate;";
			dbDelta($sql);
		}

		// 2. Force Column Updates (Fix for "Unknown Column" errors)
		$cols = $wpdb->get_results("SHOW COLUMNS FROM $this->table_licenses");
		$existing_cols = [];
		foreach($cols as $c) $existing_cols[] = $c->Field;

		if (!in_array('activation_limit', $existing_cols)) {
			$wpdb->query("ALTER TABLE $this->table_licenses ADD activation_limit int(9) DEFAULT 1 NOT NULL");
		}
		if (!in_array('activations', $existing_cols)) {
			$wpdb->query("ALTER TABLE $this->table_licenses ADD activations longtext DEFAULT NULL");
		}
		if (!in_array('source', $existing_cols)) {
			$wpdb->query("ALTER TABLE $this->table_licenses ADD source varchar(20) DEFAULT 'manual' NOT NULL");
		}

		// 3. Products Table
		$sql_products = "CREATE TABLE IF NOT EXISTS $this->table_products (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			name varchar(100) NOT NULL,
			slug varchar(50) NOT NULL,
			secret_key varchar(100) DEFAULT NULL,
			latest_version varchar(20) DEFAULT '1.0.0',
			download_url text DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug)
		) $charset_collate;";
		$wpdb->query($sql_products);
	}

	private function generate_license_key( $prefix ) {
		$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
		$parts = [];
		for ($i = 0; $i < 3; $i++) {
			$part = '';
			for ($j = 0; $j < 4; $j++) {
				$part .= $chars[rand(0, strlen($chars) - 1)];
			}
			$parts[] = $part;
		}
		return strtoupper( $prefix . '-' . implode('-', $parts) );
	}
}
