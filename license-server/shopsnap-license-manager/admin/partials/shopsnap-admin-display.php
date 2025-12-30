<div class="wrap">
	<h1><span class="dashicons dashicons-lock" style="font-size: 30px; margin-right: 10px; vertical-align: middle;"></span>ShopSnap License Manager</h1>
	
	<!-- Stats Cards -->
	<div style="display: flex; gap: 20px; margin: 20px 0;">
		<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1;">
			<h3 style="margin: 0; color: #64748b;">Total Keys</h3>
			<p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #0f172a;"><?php echo esc_html($total); ?></p>
		</div>
		<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; border-left: 4px solid #22c55e;">
			<h3 style="margin: 0; color: #64748b;">Active Users</h3>
			<p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #0f172a;"><?php echo esc_html($active); ?></p>
		</div>
		<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; border-left: 4px solid #ef4444;">
			<h3 style="margin: 0; color: #64748b;">Revoked/Refunded</h3>
			<p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #0f172a;"><?php echo esc_html($revoked); ?></p>
		</div>
	</div>

	<!-- Generator -->
	<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
		<h2>🔑 Bulk Generator</h2>
		<p>Use this to generate keys for AppSumo CSV export.</p>
		<hr>
		<table class="form-table">
			<tr>
				<th><label>Prefix</label></th>
				<td><input type="text" id="gen_prefix" value="SUMO" class="regular-text" style="text-transform: uppercase;"></td>
			</tr>
			<tr>
				<th><label>Quantity</label></th>
				<td><input type="number" id="gen_amount" value="50" min="1" max="1000" class="regular-text"></td>
			</tr>
		</table>
		<p class="submit">
			<button id="btn-generate" class="button button-primary">Generate Keys</button>
			<span id="gen-spinner" class="spinner" style="float: none;"></span>
		</p>
	</div>

	<!-- List -->
	<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
		<h2>Recent Licenses</h2>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th>ID</th>
					<th>License Key</th>
					<th>Status</th>
					<th>Generated At</th>
					<th>Device ID</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<?php if ($results) : ?>
					<?php foreach ($results as $row) : ?>
						<tr id="row-<?php echo $row->id; ?>">
							<td><?php echo $row->id; ?></td>
							<td style="font-family: monospace; font-weight: bold;"><?php echo esc_html($row->license_key); ?></td>
							<td>
								<?php if ($row->status == 'active'): ?>
									<span style="color: green; font-weight: bold;">Active</span>
								<?php else: ?>
									<span style="color: red; font-weight: bold;">Revoked</span>
								<?php endif; ?>
							</td>
							<td><?php echo date('M j, Y H:i', strtotime($row->created_at)); ?></td>
							<td>
								<?php echo $row->device_id ? esc_html($row->device_id) : '<span style="color:#ccc;">Not activated</span>'; ?>
							</td>
							<td>
								<?php if ($row->status == 'active'): ?>
									<button class="button action-btn" data-id="<?php echo $row->id; ?>" data-action="revoke">Block</button>
								<?php else: ?>
									<button class="button action-btn" data-id="<?php echo $row->id; ?>" data-action="unrevoke">Unblock</button>
								<?php endif; ?>
								<button class="button action-btn" style="color: #b91c1c;" data-id="<?php echo $row->id; ?>" data-action="delete">Delete</button>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php else: ?>
					<tr><td colspan="6">No keys found. Generate some!</td></tr>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
</div>

<script>
jQuery(document).ready(function($) {
	$('#btn-generate').click(function() {
		var btn = $(this);
		var spinner = $('#gen-spinner');
		btn.prop('disabled', true);
		spinner.addClass('is-active');
		
		$.post(ajaxurl, {
			action: 'shopsnap_generate_keys',
			nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
			amount: $('#gen_amount').val(),
			prefix: $('#gen_prefix').val()
		}, function(res) {
			btn.prop('disabled', false);
			spinner.removeClass('is-active');
			if (res.success) {
				alert(res.data.message);
				location.reload();
			} else {
				alert('Error: ' + res.data);
			}
		});
	});

	$('.action-btn').click(function() {
		var id = $(this).data('id');
		var act = $(this).data('action');
		if (!confirm('Are you sure?')) return;
		
		$.post(ajaxurl, {
			action: 'shopsnap_revoke_key',
			nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
			id: id,
			todo: act
		}, function(res) {
			if (res.success) location.reload();
		});
	});
});
</script>
