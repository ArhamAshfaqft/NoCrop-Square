<?php
/**
 * Plugin Name: ShopSnap License Manager
 * Plugin URI:  https://shopsnap.io
 * Description: Enterprise-grade license management for ShopSnap Desktop App. Handles key generation, validation, and device locking.
 * Version:     1.0.0
 * Author:      ShopSnap Team
 * Author URI:  https://shopsnap.io
 * License:     GPL-2.0+
 * Text Domain: shopsnap-license-manager
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'SHOPSNAP_VERSION', '1.0.0' );
define( 'SHOPSNAP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SHOPSNAP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 */
function activate_shopsnap_license_manager() {
	require_once SHOPSNAP_PLUGIN_DIR . 'includes/class-shopsnap-activator.php';
	ShopSnap_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_shopsnap_license_manager() {
	// Optional: Cleanup
}

register_activation_hook( __FILE__, 'activate_shopsnap_license_manager' );
register_deactivation_hook( __FILE__, 'deactivate_shopsnap_license_manager' );

/**
 * Core Plugin Class
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-shopsnap-core.php';

function run_shopsnap_license_manager() {
	$plugin = new ShopSnap_Core();
	$plugin->run();
}
run_shopsnap_license_manager();
