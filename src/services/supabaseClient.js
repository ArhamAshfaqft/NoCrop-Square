import { createClient } from '@supabase/supabase-js'

// Fallback placeholders if environment variables are not yet provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key-12345'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const SupabaseService = {
  // 1. Authentication Helpers
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username || ''
        }
      }
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async sendPasswordResetEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) throw error
    return data
  },

  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return data
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  // 2. License & AppSumo Code Verification
  async activateLicenseCode(code) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("You must be logged in to activate a code.")
    }

    const cleanCode = code.trim().toUpperCase()
    if (cleanCode.length < 5) {
      throw new Error("Invalid code length. Please enter a valid AppSumo code.")
    }

    // Update license_codes table where it matches code and is_used = false
    const { data, error } = await supabase
      .from('license_codes')
      .update({
        is_used: true,
        activated_by: user.id,
        activated_at: new Date().toISOString()
      })
      .eq('code', cleanCode)
      .eq('is_used', false)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      // Fallback for sandbox or testing: check metadata
      if (user.user_metadata?.is_pro) {
        return { success: true }
      }
      throw new Error("This code is invalid, already activated, or expired.")
    }

    // Try updating user profile table
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          is_pro: true,
          email: user.email,
          updated_at: new Date().toISOString()
        })
    } catch (e) {
      console.warn("Could not upsert profile:", e)
    }

    // Update user metadata so the local session reflects it immediately
    await supabase.auth.updateUser({
      data: { is_pro: true }
    })

    return { success: true }
  },

  async checkProStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // 1. Check user metadata first
    if (user.user_metadata?.is_pro) {
      return true
    }

    // 2. Query 'profiles' table if available
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single()
      
      if (data && !error) {
        return !!data.is_pro
      }
    } catch (e) {
      console.warn("Error checking pro database status:", e)
    }

    return false
  },

  // 3. Admin Tools
  async generateLicenseCodes(count, prefix) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized.")

    const codes = []
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    for (let i = 0; i < count; i++) {
      let code = prefix.trim().toUpperCase()
      // format: PREFIX-XXXX-XXXX
      for (let segment = 0; segment < 2; segment++) {
        let part = ''
        for (let c = 0; c < 4; c++) {
          part += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        code += (segment === 0 ? '' : '-') + part
      }
      codes.push({
        code,
        is_used: false,
        activated_by: null,
        activated_at: null
      })
    }

    const { data, error } = await supabase
      .from('license_codes')
      .insert(codes)
      .select()

    if (error) throw error
    return data
  },

  async getAdminLicenseCodes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized.")

    // Fetch all codes directly
    const { data: codes, error: codesError } = await supabase
      .from('license_codes')
      .select('code, is_used, activated_at, activated_by, created_at')
      .order('created_at', { ascending: false })

    if (codesError) throw codesError
    if (!codes || codes.length === 0) return []

    // Collect all unique user IDs that activated a code
    const userIds = [...new Set(codes.map(c => c.activated_by).filter(Boolean))]

    if (userIds.length === 0) {
      return codes.map(c => ({
        ...c,
        profiles: null
      }))
    }

    // Fetch profiles for these users to get their emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)

    const profileMap = {}
    if (profiles && !profilesError) {
      profiles.forEach(p => {
        profileMap[p.id] = p
      })
    } else if (profilesError) {
      console.warn("Could not fetch profiles for admin view:", profilesError)
    }

    return codes.map(c => ({
      ...c,
      profiles: c.activated_by ? (profileMap[c.activated_by] || { email: 'Unknown User' }) : null
    }))
  },

  async deleteLicenseCode(code) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized.")

    const { error } = await supabase
      .from('license_codes')
      .delete()
      .eq('code', code)

    if (error) throw error
    return true
  },

  async revokeLicenseCode(code) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized.")

    const { error } = await supabase
      .from('license_codes')
      .update({
        is_used: false,
        activated_by: null,
        activated_at: null
      })
      .eq('code', code)

    if (error) throw error
    return true
  }
}
