<div class="wrap" style="background: #f0f0f1; padding: 20px;">
	
	<!-- Top Bar: Scope & Search -->
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
		<div style="display: flex; align-items: center; gap: 15px;">
			<h1 style="margin: 0;">Nexus License Manager</h1>
			<select id="scope_pid" style="font-size: 16px; padding: 5px 10px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer;">
				<option value="0">All Products</option>
				<?php foreach($products as $p): ?>
					<option value="<?php echo $p->id; ?>" <?php selected($filter_pid, $p->id); ?>>
						<?php echo esc_html($p->name); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</div>
		<form method="get">
			<input type="hidden" name="page" value="shopsnap-nexus">
			<?php if($filter_pid): ?><input type="hidden" name="pid" value="<?php echo $filter_pid; ?>"><?php endif; ?>
			<input type="text" name="s" placeholder="Search Key, Email..." value="<?php echo esc_attr($search); ?>" style="width: 250px;">
			<button class="button">Search</button>
		</form>
	</div>

	<!-- Stats Cards -->
	<div style="display: flex; gap: 20px; margin-bottom: 30px;">
		<div style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); flex: 1; border-top: 4px solid #3b82f6;">
			<h3 style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Licenses</h3>
			<p style="font-size: 36px; font-weight: 800; margin: 10px 0; color: #0f172a;"><?php echo number_format($total); ?></p>
		</div>
		<div style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); flex: 1; border-top: 4px solid #22c55e;">
			<h3 style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Active Installs</h3>
			<p style="font-size: 36px; font-weight: 800; margin: 10px 0; color: #0f172a;"><?php echo number_format($active); ?></p>
		</div>
	</div>

	<!-- Batch Generator -->
	<div style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px;">
		<h2 style="margin-top: 0;">⚡ Batch Key Generator</h2>
		<p style="color:#64748b; margin-bottom: 15px;">Generate keys for multiple tiers at once (e.g. 1-Site Plan, 5-Site Plan). A CSV will be generated automatically.</p>
		
		<div style="display: flex; gap: 20px; margin-bottom: 15px;">
			<div style="flex: 1;">
				<label style="display: block; margin-bottom: 5px; font-weight: 600;">Product</label>
				<select id="gen_pid" style="width: 100%;" <?php echo ($filter_pid > 0) ? 'disabled' : ''; ?>>
					<?php foreach($products as $p): ?>
						<option value="<?php echo $p->id; ?>" <?php selected($filter_pid, $p->id); ?>><?php echo esc_html($p->name); ?></option>
					<?php endforeach; ?>
				</select>
			</div>
			<div style="flex: 1;">
				<label style="display: block; margin-bottom: 5px; font-weight: 600;">Prefix</label>
				<input type="text" id="gen_prefix" value="SUMO" style="width: 100%; text-transform: uppercase;">
			</div>
		</div>

		<!-- Tiers Table -->
		<table class="wp-list-table widefat striped" id="tier-table" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 15px;">
			<thead>
				<tr>
					<th>Tier Name (Optional)</th>
					<th>Max Activations (e.g. 1, 5)</th>
					<th>Quantity (e.g. 50)</th>
					<th style="width: 50px;"></th>
				</tr>
			</thead>
			<tbody>
				<tr class="tier-row">
					<td><input type="text" placeholder="Tier 1 (Personal)" class="tier-name" style="width: 100%;"></td>
					<td><input type="number" class="tier-limit" value="1" min="1" style="width: 100px;"></td>
					<td><input type="number" class="tier-amount" value="50" min="1" max="2000" style="width: 100px;"></td>
					<td></td>
				</tr>
			</tbody>
		</table>
		
		<button class="button" id="btn-add-tier" style="margin-right: 10px;">+ Add Tier</button>
		<button id="btn-generate" class="button button-primary button-large">Generate All Batches</button>
		
		<div id="gen-result" style="margin-top: 15px; display: none;"></div>
	</div>

	<!-- License Table -->
	<div style="background: #fff; padding: 0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
		<div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
				<h2 style="margin: 0;">Recent Licenses</h2>
				<?php if($search): ?>
					<span style="background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">Searching: "<?php echo esc_html($search); ?>"</span>
				<?php endif; ?>
			</div>

			<!-- Tabs -->
			<div class="shopsnap-tabs" style="border-bottom: 1px solid #e2e8f0; margin-bottom: 15px;">
				<?php
					$base_link = 'admin.php?page=shopsnap-nexus' . ($filter_pid > 0 ? '&pid='.$filter_pid : '');
					$current = isset($_GET['view']) ? $_GET['view'] : 'all';
				?>
				<a href="<?php echo $base_link . '&view=all'; ?>" class="nav-tab <?php echo $current=='all'?'nav-tab-active':''; ?>" style="border:none; border-bottom: 3px solid <?php echo $current=='all'?'#2563eb':'transparent'; ?>; background: none;">All</a>
				<a href="<?php echo $base_link . '&view=claimed'; ?>" class="nav-tab <?php echo $current=='claimed'?'nav-tab-active':''; ?>" style="border:none; border-bottom: 3px solid <?php echo $current=='claimed'?'#2563eb':'transparent'; ?>; background: none;">Active & Claimed</a>
				<a href="<?php echo $base_link . '&view=unclaimed'; ?>" class="nav-tab <?php echo $current=='unclaimed'?'nav-tab-active':''; ?>" style="border:none; border-bottom: 3px solid <?php echo $current=='unclaimed'?'#2563eb':'transparent'; ?>; background: none;">Unclaimed</a>
				<a href="<?php echo $base_link . '&view=revoked'; ?>" class="nav-tab <?php echo $current=='revoked'?'nav-tab-active':''; ?>" style="border:none; border-bottom: 3px solid <?php echo $current=='revoked'?'#2563eb':'transparent'; ?>; background: none; color: #dc2626;">Cancelled / Revoked</a>
			</div>

			<!-- Bulk Actions -->
			<div style="display: flex; gap: 10px; align-items: center;">
				<select id="bulk-action-selector">
					<option value="-1">Bulk Actions</option>
					<option value="revoke">Revoke Selected</option>
					<option value="delete">Delete Selected</option>
				</select>
				<button id="do-action" class="button action">Apply</button>
			</div>
		</div>
		
		<table class="wp-list-table widefat striped" style="box-shadow: none; border: none;">
			<thead>
				<tr>
					<td id="cb" class="manage-column column-cb check-column"><input type="checkbox" id="cb-select-all-1"></td>
					<th>ID</th>
					<?php if (!$filter_pid): ?><th>Product</th><?php endif; ?>
					<th>License Key</th>
					<th>Status</th>
					<th>Device ID</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<?php if ($results) : ?>
					<?php foreach ($results as $row) : ?>
						<tr id="row-<?php echo $row->id; ?>">
							<th scope="row" class="check-column"><input type="checkbox" name="post[]" value="<?php echo $row->id; ?>"></th>
							<td>#<?php echo $row->id; ?></td>
							<?php if (!$filter_pid): ?>
								<td><strong><?php echo esc_html($row->product_name); ?></strong></td>
							<?php endif; ?>
							<td>
								<code style="font-size: 13px; background: #f1f5f9; padding: 3px 6px; border-radius: 4px;"><?php echo esc_html($row->license_key); ?></code>
								<?php if($row->source && $row->source !== 'admin_gen' && $row->source !== 'manual'): ?>
									<br><small style="color: #64748b;"><?php echo esc_html($row->source); ?></small>
								<?php endif; ?>
							</td>
							<td id="status-<?php echo $row->id; ?>">
								<?php if ($row->status == 'active'): ?>
									<span style="color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Active</span> <span style="font-size:10px; color:#64748b;">(Max: <?php echo $row->activation_limit ?? 1; ?>)</span>
								<?php elseif ($row->status == 'revoked'): ?>
									<span style="color: #991b1b; background: #fee2e2; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Revoked</span>
								<?php endif; ?>
							</td>
							<td style="color: #64748b; font-size: 12px;">
								<?php echo $row->device_id ? esc_html($row->device_id) : '<em style="opacity: 0.5">Unclaimed</em>'; ?>
							</td>
							<td>
								<?php if ($row->status == 'active'): ?>
									<button class="button-link" style="color: #d97706;" onclick="revokeKey(<?php echo $row->id; ?>)">Revoke</button> | 
								<?php endif; ?>
								<button class="button-link" style="color: #ef4444;" onclick="deleteKey(<?php echo $row->id; ?>)">Delete</button>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php else: ?>
					<tr><td colspan="7" style="padding: 20px; text-align: center; color: #64748b;">No licenses found.</td></tr>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
</div>

<script>
jQuery(document).ready(function($) {
	
	// Scope Switcher
	$('#scope_pid').change(function() {
		var pid = $(this).val();
		window.location.href = 'admin.php?page=shopsnap-nexus' + (pid > 0 ? '&pid=' + pid : '');
	});

	// Add Tier Row
	$('#btn-add-tier').click(function(e) {
		e.preventDefault();
		var row = '<tr class="tier-row">' +
			'<td><input type="text" placeholder="Tier Name" class="tier-name" style="width: 100%;"></td>' +
			'<td><input type="number" class="tier-limit" value="1" min="1" style="width: 100px;"></td>' +
			'<td><input type="number" class="tier-amount" value="50" min="1" max="2000" style="width: 100px;"></td>' +
			'<td><button class="button button-small btn-remove-tier" style="color: #b91c1c;">X</button></td>' +
			'</tr>';
		$('#tier-table tbody').append(row);
	});

	$(document).on('click', '.btn-remove-tier', function() {
		$(this).closest('tr').remove();
	});

	// Select All Checkbox
	$('#cb-select-all-1').click(function() {
		$('input[name="post[]"]').prop('checked', this.checked);
	});

	// Bulk Action Apply
	$('#do-action').click(function(e) {
		e.preventDefault();
		var action = $('#bulk-action-selector').val();
		if (action === '-1') {
			alert('Please select an action.');
			return;
		}

		var ids = [];
		$('input[name="post[]"]:checked').each(function() {
			ids.push($(this).val());
		});

		if (ids.length === 0) {
			alert('No items selected.');
			return;
		}

		if (!confirm('Are you sure you want to apply "' + action + '" to ' + ids.length + ' items?')) return;

		$(this).prop('disabled', true).text('Applying...');

		$.post(ajaxurl, {
			action: 'shopsnap_bulk_action',
			nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
			todo: action,
			ids: ids
		}, function(res) {
			if (res.success) {
				location.reload();
			} else {
				alert('Error: ' + (res.data || 'Unknown error'));
				$('#do-action').prop('disabled', false).text('Apply');
			}
		});
	});

	// Generate Batches
	$('#btn-generate').click(function() {
		var btn = $(this);
		var result = $('#gen_result'); // Wait, ID usage fix below
		var pid = $('#scope_pid').val() > 0 ? $('#scope_pid').val() : $('#gen_pid').val();
		
		// Collect Batches
		var batches = [];
		$('.tier-row').each(function() {
			var name  = $(this).find('.tier-name').val();
			var limit = $(this).find('.tier-limit').val();
			var amt   = $(this).find('.tier-amount').val();
			if (amt > 0) {
				batches.push({ name: name, limit: limit, amount: amt });
			}
		});

		if (batches.length === 0) {
			alert('Please add at least one tier with quantity > 0.');
			return;
		}

		btn.prop('disabled', true).text('Generating...');
		$('#gen-result').hide();

		$.post(ajaxurl, {
			action: 'shopsnap_generate_keys',
			nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
			batches: batches,
			prefix: $('#gen_prefix').val(),
			product_id: pid
		}, function(res) {
			btn.prop('disabled', false).text('Generate All Batches');
			
			if (res.success) {
				var msg = '<div class="notice notice-success inline" style="margin: 0;"><p>' + res.data.message + ' ';
				msg += '<button id="btn-csv" class="button button-small">⬇️ Download CSV</button></p></div>';
				$('#gen-result').html(msg).show();
				
				// Prepend new rows
				if (res.data.rows && res.data.rows.length > 0) {
					var rowsHtml = '';
					res.data.rows.forEach(function(row) {
						rowsHtml += '<tr id="row-' + row.id + '" style="background-color: #f0fdf4;">';
						rowsHtml += '<td>#' + row.id + '</td>';
						<?php if (!$filter_pid): ?>
						rowsHtml += '<td><strong>' + (row.product_name || 'Unknown') + '</strong></td>';
						<?php endif; ?>
						rowsHtml += '<td><code style="font-size: 13px; background: #fff; padding: 3px 6px; border-radius: 4px;">' + row.license_key + '</code>';
						if (row.source && row.source !== 'admin_gen' && row.source !== 'manual') {
							rowsHtml += '<br><small style="color: #64748b;">' + row.source + '</small>';
						}
						rowsHtml += '</td>';
						rowsHtml += '<td><span style="color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase;">Active</span> <span style="font-size:10px; color:#64748b;">(Max: '+ (row.activation_limit||1) +')</span></td>';
						rowsHtml += '<td style="color: #64748b; font-size: 12px;">' + (row.device_id || '<em style="opacity: 0.5">Unclaimed</em>') + '</td>';
						rowsHtml += '<td><button class="button-link" style="color: #d97706;" onclick="revokeKey(' + row.id + ')">Revoke</button> | <button class="button-link" style="color: #ef4444;" onclick="deleteKey(' + row.id + ')">Delete</button></td>';
						rowsHtml += '</tr>';
					});
					$('table tbody').prepend(rowsHtml);
				}
				
				// CSV Download
				$('#btn-csv').click(function() {
					downloadCSV(res.data.keys, 'licenses-batch-'+pid+'.csv');
				});

			} else {
				alert('Error: ' + res.data);
			}
		});
	});
});

function revokeKey(id) {
	if(!confirm('Revoke this key? The user will lose Pro access immediately.')) return;
	jQuery.post(ajaxurl, {
		action: 'shopsnap_revoke_key',
		nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
		id: id
	}, function() { location.reload(); });
}

function deleteKey(id) {
	if(!confirm('Permanently DELETE this key? It will be gone forever.')) return;
	jQuery.post(ajaxurl, {
		action: 'shopsnap_delete_key',
		nonce: '<?php echo wp_create_nonce("shopsnap_admin_nonce"); ?>',
		id: id
	}, function() { jQuery('#row-'+id).remove(); });
}

function downloadCSV(keys, filename) {
	// keys is array of {key: '...', limit: 5, tier: 'Tier Name'} or just valid strings if legacy
	let csvContent = "data:text/csv;charset=utf-8,License Key,Max Activations,Tier Name\n";
	
	keys.forEach(function(item) {
		if (typeof item === 'object') {
			var t = item.tier ? item.tier.replace(/,/g, ' ') : ''; 
			csvContent += item.key + "," + item.limit + "," + t + "\n";
		} else {
			csvContent += item + ",1,\n"; // Fallback
		}
	});

	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
}
</script>
