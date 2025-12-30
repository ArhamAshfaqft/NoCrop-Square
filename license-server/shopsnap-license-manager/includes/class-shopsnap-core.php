<?php

class ShopSnap_Core {

	protected $loader;
	protected $plugin_name;
	protected $version;

	public function __construct() {
		$this->plugin_name = 'shopsnap-license-manager';
		$this->version = SHOPSNAP_VERSION;

		$this->load_dependencies();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	private function load_dependencies() {
		// Include Core Classes
		require_once SHOPSNAP_PLUGIN_DIR . 'includes/class-shopsnap-loader.php';
		require_once SHOPSNAP_PLUGIN_DIR . 'includes/class-shopsnap-api.php';
		require_once SHOPSNAP_PLUGIN_DIR . 'admin/class-shopsnap-admin.php';

		$this->loader = new ShopSnap_Loader();
	}

	private function define_admin_hooks() {
		$plugin_admin = new ShopSnap_Admin( $this->get_plugin_name(), $this->get_version() );
		
		// Admin Menu & Styles
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'add_plugin_admin_menu' );
		// $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		
		// AJAX Handlers for Dashboard
		$this->loader->add_action( 'wp_ajax_shopsnap_generate_keys', $plugin_admin, 'ajax_generate_keys' );
		$this->loader->add_action( 'wp_ajax_shopsnap_revoke_key', $plugin_admin, 'ajax_revoke_key' );
		$this->loader->add_action( 'wp_ajax_shopsnap_delete_key', $plugin_admin, 'ajax_delete_key' );
		$this->loader->add_action( 'wp_ajax_shopsnap_bulk_action', $plugin_admin, 'ajax_bulk_action' );
	}

	private function define_public_hooks() {
		$plugin_api = new ShopSnap_API( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'rest_api_init', $plugin_api, 'register_routes' );
	}

	public function run() {
		$this->loader->run();
	}

	public function get_plugin_name() {
		return $this->plugin_name;
	}

	public function get_version() {
		return $this->version;
	}
}
