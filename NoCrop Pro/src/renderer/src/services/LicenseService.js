
// Configuration
// TODO: Replace with live URL when ready.
const API_URL = 'https://shopsnap.local/wp-json/shopsnap/v1'

export const LicenseService = {
  
  async activate(key) {
    let deviceId = localStorage.getItem('shopsnap_device_id')
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem('shopsnap_device_id', deviceId)
    }

    try {
      const response = await fetch(`${API_URL}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          license_key: key, 
          device_id: deviceId,
          product_slug: 'shopsnap' 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Activation Failed')
      }

      return data
    } catch (error) {
      console.error("License Activation Error:", error)
      throw error
    }
  },

  async verify(key) {
    let deviceId = localStorage.getItem('shopsnap_device_id')
    if (!deviceId) return { valid: false }

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            license_key: key, 
            device_id: deviceId,
            product_slug: 'shopsnap',
            version: '1.0.0' // TODO: Get from package.json
        })
      })
      
      if (!response.ok) return { valid: false }
      
      const data = await response.json()
      // data.update will contain version info if available
      return data
    } catch (error) {
      console.error("Verification Error:", error)
      return { valid: false, error: 'network_error' }
    }
  }
}
