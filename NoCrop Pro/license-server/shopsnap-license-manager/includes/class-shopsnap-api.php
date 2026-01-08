<?php

class ShopSnap_API {

	private $plugin_name;
	private $version;
	
	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version = $version;
	}

	public function register_routes() {
		register_rest_route( 'shopsnap/v1', '/activate', array(
			'methods'  => 'POST',
			'callback' => array( $this, 'activate_key' ),
			'permission_callback' => '__return_true',
		));
		
		register_rest_route( 'shopsnap/v1', '/verify', array(
			'methods'  => 'POST',
			'callback' => array( $this, 'verify_key' ),
			'permission_callback' => '__return_true',
		));
	}

	public function activate_key( $request ) {
		$key   = sanitize_text_field( $request->get_param( 'license_key' ) );
		$hwid  = sanitize_text_field( $request->get_param( 'device_id' ) );
		$slug  = sanitize_text_field( $request->get_param( 'product_slug' ) );

		if ( empty( $key ) || empty( $hwid ) ) return new WP_Error( 'missing_params', 'Missing parameters.', array( 'status' => 400 ) );

		global $wpdb;
		$t_lic = $wpdb->prefix . 'shopsnap_licenses';
		
		// Resolve Product
		$product = $this->get_product_by_slug($slug);
		if (!$product) return new WP_Error( 'invalid_product', 'Invalid Product Slug', array( 'status' => 404 ) );

		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t_lic WHERE license_key = %s AND product_id = %d", $key, $product->id ) );

		if ( ! $row ) return new WP_Error( 'invalid_key', 'Invalid License Key.', array( 'status' => 404 ) );
		if ( $row->status !== 'active' ) return new WP_Error( 'key_revoked', 'License revoked.', array( 'status' => 403 ) );

		// Multi-Device Logic
		$activations = empty($row->activations) ? [] : json_decode($row->activations, true);
		if (!is_array($activations)) $activations = [];
		
		// Legacy migration (if users had single device_id)
		if (!empty($row->device_id) && empty($activations)) {
			$activations[] = $row->device_id;
		}

		if (in_array($hwid, $activations)) {
			return array( 'success' => true, 'message' => 'Already Active', 'plan' => 'pro' );
		}

		$limit = isset($row->activation_limit) ? intval($row->activation_limit) : 1;
		if ($limit < 1) $limit = 1;

		if (count($activations) >= $limit) {
			return new WP_Error( 'limit_reached', 'Max activations reached (' . $limit . ').', array( 'status' => 409 ) );
		}

		// Add new device
		$activations[] = $hwid;
		$enc_activations = json_encode($activations);
		
		// Update DB
		$wpdb->update( 
			$t_lic, 
			array( 
				'activations' => $enc_activations, 
				'activation_date' => current_time( 'mysql' ),
				'device_id' => $hwid // Legacy: keep last device as primary for simple table view
			), 
			array( 'id' => $row->id ) 
		);

		return array( 'success' => true, 'message' => 'Activated', 'plan' => 'pro' );
	}

	public function verify_key( $request ) {
		$key   = sanitize_text_field( $request->get_param( 'license_key' ) );
		$hwid  = sanitize_text_field( $request->get_param( 'device_id' ) );
		$slug  = sanitize_text_field( $request->get_param( 'product_slug' ) );
		$ver   = sanitize_text_field( $request->get_param( 'version' ) );

		global $wpdb;
		$t_lic = $wpdb->prefix . 'shopsnap_licenses';

		$product = $this->get_product_by_slug($slug);
		if (!$product) return array( 'valid' => false, 'reason' => 'invalid_product' );

		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t_lic WHERE license_key = %s AND product_id = %d", $key, $product->id ) );

		if ( ! $row || $row->status !== 'active' ) return array( 'valid' => false, 'reason' => 'invalid_license' );

		// Check Device in Array
		$activations = empty($row->activations) ? [] : json_decode($row->activations, true);
		if (!is_array($activations)) $activations = [];
		
		// Legacy fallback
		if (!empty($row->device_id) && empty($activations)) {
			if ($row->device_id === $hwid) $activations[] = $hwid;
		}

		if (!in_array($hwid, $activations)) {
			return array( 'valid' => false, 'reason' => 'device_mismatch' );
		}

		// Version Check
		$update_info = null;
		if ( $ver && $product->latest_version && version_compare($ver, $product->latest_version, '<') ) {
			$update_info = array(
				'available' => true,
				'version' => $product->latest_version,
				'url' => $product->download_url,
				'mandatory' => false 
			);
		}

		return array( 'valid' => true, 'update' => $update_info );
	}

	private function get_product_by_slug($slug) {
		global $wpdb;
		$t_prod = $wpdb->prefix . 'shopsnap_products';
		if (empty($slug)) $slug = 'shopsnap'; // Default legacy
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t_prod WHERE slug = %s", $slug ) );
	}
}
