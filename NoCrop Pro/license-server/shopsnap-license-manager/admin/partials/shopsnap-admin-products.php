<div class="wrap">
	<h1>📦 Product Management</h1>
	
	<div style="display: flex; gap: 20px;">
		
		<!-- List -->
		<div style="flex: 2;">
			<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Slug</th>
							<th>Latest Version</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($products as $p): ?>
						<tr>
							<td><strong><?php echo esc_html($p->name); ?></strong></td>
							<td><code><?php echo esc_html($p->slug); ?></code></td>
							<td><span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 10px; font-weight: bold;"><?php echo esc_html($p->latest_version); ?></span></td>
							<td>
								<button class="button" onclick="editProduct(<?php echo htmlspecialchars(json_encode($p)); ?>)">Edit</button>
								<button class="button button-secondary" onclick="showSnippet('<?php echo esc_js($p->slug); ?>')">Get Code</button>
							</td>
						</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<!-- Snippet Area -->
				<div id="snippet-area" style="display:none; margin-top: 20px; background: #1e293b; color: #fff; padding: 20px; border-radius: 8px;">
					<h3 style="margin-top: 0; color: #fff;">🔌 Integration Code for: <span id="snip-slug" style="color: #38bdf8;"></span></h3>
					<p style="color: #94a3b8;">Copy this into your Electron app's <code>src/services/LicenseService.js</code>.</p>
					<textarea id="snip-code" style="width: 100%; height: 300px; background: #0f172a; color: #a5b4fc; border: 1px solid #334155; font-family: monospace; font-size: 13px; padding: 10px;" readonly></textarea>
					<button class="button" onclick="document.getElementById('snippet-area').style.display='none'" style="margin-top: 10px;">Close</button>
				</div>
			</div>
		</div>

		<!-- Form -->
		<div style="flex: 1;">
			<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
				<h2 id="form-title">Add New Product</h2>
				<form method="post">
					<?php wp_nonce_field('shopsnap_product_nonce'); ?>
					<input type="hidden" name="id" id="p_id" value="0">
					
					<p>
						<label>Product Name</label><br>
						<input type="text" name="name" id="p_name" class="large-text" required placeholder="e.g. PixelMate Pro">
					</p>
					<p>
						<label>Slug (Unique ID)</label><br>
						<input type="text" name="slug" id="p_slug" class="large-text" required placeholder="e.g. pixelmate">
						<span class="description">Used in API verification.</span>
					</p>
					<p>
						<label>Latest Version</label><br>
						<input type="text" name="version" id="p_version" class="regular-text" value="1.0.0">
					</p>
					<p>
						<label>Download/Update URL</label><br>
						<input type="url" name="url" id="p_url" class="large-text" placeholder="https://...">
					</p>
					<p>
						<input type="submit" name="shopsnap_save_product" class="button button-primary" value="Save Product">
						<button type="button" class="button" id="btn-cancel" style="display:none;" onclick="resetForm()">Cancel</button>
					</p>
				</form>
			</div>
		</div>

	</div>
</div>

<script>
function editProduct(p) {
	document.getElementById('form-title').innerText = 'Edit Product: ' + p.name;
	document.getElementById('p_id').value = p.id;
	document.getElementById('p_name').value = p.name;
	document.getElementById('p_slug').value = p.slug;
	document.getElementById('p_version').value = p.latest_version;
	document.getElementById('p_url').value = p.download_url;
	document.getElementById('btn-cancel').style.display = 'inline-block';
}

function resetForm() {
	document.getElementById('form-title').innerText = 'Add New Product';
	document.getElementById('p_id').value = 0;
	document.getElementById('p_name').value = '';
	document.getElementById('p_slug').value = '';
	document.getElementById('p_version').value = '1.0.0';
	document.getElementById('p_url').value = '';
	document.getElementById('btn-cancel').style.display = 'none';
}

function showSnippet(slug) {
	var domain = window.location.origin;
	var apiUrl = domain + '/wp-json/shopsnap/v1'; // Auto-detect API URL
	
	var code = `// LicenseService.js for ` + slug + `
const API_URL = '` + apiUrl + `' // Your Server

export const LicenseService = {
  async activate(key) {
    let deviceId = localStorage.getItem('device_id') || crypto.randomUUID()
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', deviceId)

    const res = await fetch(\`\${API_URL}/activate\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        license_key: key, 
        device_id: deviceId,
        product_slug: '` + slug + `' 
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Activation Failed')
    return data
  },

  async verify(key) {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) return { valid: false }

    const res = await fetch(\`\${API_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          license_key: key, 
          device_id: deviceId,
          product_slug: '` + slug + `',
          version: '1.0.0' // Replace with app version
      })
    })
    if (!res.ok) return { valid: false }
    return await res.json() // Returns { valid: true, update: { ... } }
  }
}`;
	document.getElementById('snip-slug').innerText = slug;
	document.getElementById('snip-code').value = code;
	document.getElementById('snippet-area').style.display = 'block';
	window.scrollTo(0, document.body.scrollHeight);
}
</script>
