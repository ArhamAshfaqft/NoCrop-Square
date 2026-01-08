<?php

class ShopSnap_Activator {

	public static function activate() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		// 1. Products Table (NEW)
		$table_products = $wpdb->prefix . 'shopsnap_products';
		$sql_products = "CREATE TABLE $table_products (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			name varchar(100) NOT NULL,
			slug varchar(50) NOT NULL UNIQUE,
			secret_key varchar(100) DEFAULT NULL,
			latest_version varchar(20) DEFAULT '1.0.0',
			download_url text DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug)
		) $charset_collate;";

		// 2. Licenses Table (Updated with product_id)
		$table_licenses = $wpdb->prefix . 'shopsnap_licenses';
		$sql_licenses = "CREATE TABLE $table_licenses (
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

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		
		// Run Delta
		dbDelta( $sql_products );
		dbDelta( $sql_licenses );

		// 3. Seed Default Product (ShopSnap) if empty
		if ( $wpdb->get_var("SELECT COUNT(*) FROM $table_products") == 0 ) {
			$wpdb->insert(
				$table_products,
				array(
					'name' => 'ShopSnap Desktop',
					'slug' => 'shopsnap',
					'latest_version' => '1.0.0',
					'download_url' => ''
				)
			);
		}
	}
}
