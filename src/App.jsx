import React, { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { supabase, SupabaseService } from './services/supabaseClient'
import { ImageProcessorService } from './services/imageProcessor'
import icon from './assets/icon.png'
import LandingPage from './components/LandingPage'
import {
  LayoutDashboard,
  Scaling,
  Stamp,
  FileType,
  Settings,
  FolderOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FilePenLine,
  Moon,
  Sun,
  Save,
  Download,
  UploadCloud,
  Trash2,
  XCircle,
  Lock,
  Unlock,
  LogOut,
  Sparkles,
  Minimize2,
  ArrowLeft,
  Hourglass,
  Coins,
  TrendingUp,
  ShieldAlert,
  Key,
  Search,
  RefreshCw
} from 'lucide-react'
import './assets/main.css'

// --- Custom Dropdown Selector ---
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={wrapperRef} style={{ position: 'relative', minWidth: '350px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: 'var(--input-bg)',
          color: 'var(--text-main)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 1px var(--primary)' : 'none'
        }}
      >
        <span style={{ color: selectedOption ? 'var(--text-main)' : 'var(--text-secondary)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-secondary)' }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
          padding: '5px'
        }}>
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="custom-option"
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '6px',
                color: 'var(--text-main)',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--input-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  // Image Processing States (Images are objects: { id, file, name, previewUrl })
  const [images, setImages] = useState([])
  const [view, setView] = useState('landing')

  // Productivity / Analytics Stats
  const [stats, setStats] = useState(() => {
    try {
      const stored = localStorage.getItem('optisnap_stats')
      return stored ? JSON.parse(stored) : { processedCount: 0, timeSavedSeconds: 0, costSaved: 0 }
    } catch {
      return { processedCount: 0, timeSavedSeconds: 0, costSaved: 0 }
    }
  })

  // License & Supabase Auth States
  const [session, setSession] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login', 'signup', 'forgot-password'
  const [resetPassword, setResetPassword] = useState('')
  const [confirmResetPassword, setConfirmResetPassword] = useState('')

  // Admin Portal States
  const [adminCodes, setAdminCodes] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [generateCount, setGenerateCount] = useState(50)
  const [generatePrefix, setGeneratePrefix] = useState('OPTSNP-')
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [adminStatusFilter, setAdminStatusFilter] = useState('all') // 'all', 'used', 'unused'

  // Feature Settings
  const loadSettings = (key, defaultVal) => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultVal
  }

  const [resizeSettings, setResizeSettings] = useState(() => loadSettings('optisnap_resize', { active: true, width: '800', height: '800', mode: 'contain', bgMode: 'solid', bgColor: '#ffffff' }))
  const [watermarkSettings, setWatermarkSettings] = useState(() => loadSettings('optisnap_watermark', { active: false, type: 'text', text: 'Confidential', position: 'bottom-right', opacity: 0.7, logoFile: null }))
  const [renameSettings, setRenameSettings] = useState(() => loadSettings('optisnap_rename', { active: false, baseName: '', startSeq: 1 }))
  const [convertSettings, setConvertSettings] = useState(() => loadSettings('optisnap_convert', { active: true, format: 'jpg', quality: 90 }))
  const [compressSettings, setCompressSettings] = useState(() => loadSettings('optisnap_compress', { active: false, maxSizeMB: 1.0 }))
  const [backgroundRemovalActive, setBackgroundRemovalActive] = useState(() => loadSettings('optisnap_bg_removal', false))
  const [filenameSuffix, setFilenameSuffix] = useState(() => localStorage.getItem('optisnap_suffix') || '_processed')
  const [selectedPresetId, setSelectedPresetId] = useState(null)

  // Listen for Supabase Authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkUserProStatus()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session) {
        checkUserProStatus()
        if (event === 'PASSWORD_RECOVERY') {
          setView('reset-password')
        } else {
          setView(currentView => {
            if (currentView === 'auth') {
              setCurrentTab('dashboard')
              return 'app'
            }
            return currentView
          })
        }
      }
      else setIsPro(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserProStatus = async () => {
    try {
      const pro = await SupabaseService.checkProStatus()
      setIsPro(pro)
    } catch (e) {
      console.error(e)
    }
  }

  // Sync Stats with Supabase User Metadata
  useEffect(() => {
    if (session && session.user) {
      const remoteStats = session.user.user_metadata?.stats
      if (remoteStats) {
        setStats(prev => {
          const merged = {
            processedCount: Math.max(prev.processedCount || 0, remoteStats.processedCount || 0),
            timeSavedSeconds: Math.max(prev.timeSavedSeconds || 0, remoteStats.timeSavedSeconds || 0),
            costSaved: Math.max(prev.costSaved || 0, remoteStats.costSaved || 0)
          }
          try {
            localStorage.setItem('optisnap_stats', JSON.stringify(merged))
          } catch (e) {}
          
          if (merged.processedCount > (remoteStats.processedCount || 0)) {
            supabase.auth.updateUser({
              data: { stats: merged }
            }).catch(err => console.warn("Failed to sync stats to server", err))
          }
          return merged
        })
      } else {
        if (stats.processedCount > 0) {
          supabase.auth.updateUser({
            data: { stats }
          }).catch(err => console.warn("Failed to initialize stats on server", err))
        }
      }
    }
  }, [session])

  // Persistence effect for settings
  useEffect(() => {
    localStorage.setItem('optisnap_suffix', filenameSuffix)
    localStorage.setItem('optisnap_resize', JSON.stringify(resizeSettings))
    localStorage.setItem('optisnap_watermark', JSON.stringify({ ...watermarkSettings, logoFile: null })) // Do not serialize logo File object
    localStorage.setItem('optisnap_rename', JSON.stringify(renameSettings))
    localStorage.setItem('optisnap_convert', JSON.stringify(convertSettings))
    localStorage.setItem('optisnap_compress', JSON.stringify(compressSettings))
    localStorage.setItem('optisnap_bg_removal', JSON.stringify(backgroundRemovalActive))
  }, [filenameSuffix, resizeSettings, watermarkSettings, renameSettings, convertSettings, compressSettings, backgroundRemovalActive])

  // Clean up ObjectURLs when images are cleared/removed
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      })
    }
  }, [images])

  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)

  // Presets Configuration
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('optisnap_presets')
    if (saved) return JSON.parse(saved)

    return [
      {
        id: 1,
        name: "Shopify - Product Page (2000x2000 Square Contain)",
        isDefault: true,
        settings: {
          resize: { width: "2000", height: "2000", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 80, active: true },
          compress: { active: true, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_shopify",
          bgRemoval: false
        }
      },
      {
        id: 2,
        name: "Etsy - Listing Photo (3000x3000 Blur Padding Premium)",
        isDefault: true,
        settings: {
          resize: { width: "3000", height: "3000", mode: "contain", bgMode: "blur", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 85, active: true },
          compress: { active: false, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_etsy",
          bgRemoval: false
        }
      },
      {
        id: 3,
        name: "Amazon - High-Res Zoom (1600x1600 solid white)",
        isDefault: true,
        settings: {
          resize: { width: "1600", height: "1600", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 95, active: true },
          compress: { active: true, maxSizeMB: 1.5 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_amazon",
          bgRemoval: false
        }
      },
      {
        id: 4,
        name: "Pinterest Pin - Vertical (1000x1500)",
        isDefault: true,
        settings: {
          resize: { width: "1000", height: "1500", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "webp", quality: 80, active: true },
          compress: { active: false, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_pinterest",
          bgRemoval: false
        }
      },
      {
        id: 5,
        name: "Instagram Portrait - Social (1080x1350)",
        isDefault: true,
        settings: {
          resize: { width: "1080", height: "1350", mode: "contain", bgMode: "blur", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 80, active: true },
          compress: { active: false, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_ig_portrait",
          bgRemoval: false
        }
      },
      {
        id: 6,
        name: "eBay Product Listing (1600x1600 Solid White)",
        isDefault: true,
        settings: {
          resize: { width: "1600", height: "1600", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 90, active: true },
          compress: { active: true, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_ebay",
          bgRemoval: false
        }
      },
      {
        id: 7,
        name: "WooCommerce Product (1200x1200 WebP)",
        isDefault: true,
        settings: {
          resize: { width: "1200", height: "1200", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "webp", quality: 85, active: true },
          compress: { active: true, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_wc",
          bgRemoval: false
        }
      },
      {
        id: 8,
        name: "Poshmark Seller (1024x1024 Square)",
        isDefault: true,
        settings: {
          resize: { width: "1024", height: "1024", mode: "contain", bgMode: "solid", bgColor: "#ffffff", active: true },
          watermark: { text: "", position: "bottom-right", active: false },
          convert: { format: "jpg", quality: 90, active: true },
          compress: { active: false, maxSizeMB: 1.0 },
          rename: { active: false, baseName: "", startSeq: 1 },
          suffix: "_poshmark",
          bgRemoval: false
        }
      }
    ]
  })
  const [newPresetName, setNewPresetName] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0, statusText: '' })

  // Theme Settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Presets Persistence
  useEffect(() => {
    localStorage.setItem('optisnap_presets', JSON.stringify(presets))
  }, [presets])

  // Ingestion: File picker & drag-and-drop
  const handleAddFiles = (fileList) => {
    const fileArray = Array.from(fileList).filter(file => file.type.startsWith('image/'))
    if (fileArray.length === 0) {
      toast.error("No valid image files detected.")
      return
    }

    // Daily Free Limit Check on Loading Files
    const dailyFreeLimit = 10
    const isFreeTrial = !session || !isPro

    if (isFreeTrial) {
      const todayStr = new Date().toDateString()
      const savedDate = localStorage.getItem('optisnap_free_date')
      const savedCount = localStorage.getItem('optisnap_free_count')
      let processedToday = 0

      if (savedDate === todayStr) {
        processedToday = parseInt(savedCount || '0', 10)
      }

      const remainingAllowance = dailyFreeLimit - processedToday
      const currentLoadedCount = images.length
      const totalNewCount = currentLoadedCount + fileArray.length

      if (remainingAllowance <= 0) {
        toast.custom((t) => (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid #ef4444',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '360px'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                Daily Limit Reached (10/10)
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                You have processed <b>10 free images today</b>. Upgrade to Pro in Settings to process more files!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ), { duration: 8000 })
        return
      }

      if (totalNewCount > remainingAllowance) {
        toast.custom((t) => (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--primary)',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '360px'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--primary)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                Upload Limit Exceeded
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                You have <b>{remainingAllowance} free image(s) left</b> for today, but tried to load {totalNewCount}. Upgrade to Pro for unlimited files!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ), { duration: 8000 })
        return
      }
    }

    const newImages = fileArray.map(file => ({
      id: crypto.randomUUID(),
      file: file,
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    }))

    setImages(prev => [...prev, ...newImages])
    toast.success(`Loaded ${newImages.length} image(s)`)
  }

  const handleSelectFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = (e) => {
      if (e.target.files) {
        handleAddFiles(e.target.files)
      }
    }
    input.click()
  }

  const savePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name")
      return
    }
    const newPreset = {
      id: Date.now(),
      name: newPresetName,
      settings: {
        resize: resizeSettings,
        watermark: watermarkSettings,
        convert: convertSettings,
        rename: renameSettings,
        compress: compressSettings,
        suffix: filenameSuffix,
        bgRemoval: backgroundRemovalActive
      }
    }
    setPresets([...presets, newPreset])
    setNewPresetName('')
    toast.success("Preset Saved!")
  }

  const loadPreset = (preset) => {
    setResizeSettings(preset.settings.resize)
    setWatermarkSettings(preset.settings.watermark)
    
    // Safely load background removal active status
    const targetBgRemovalActive = preset.settings.bgRemoval !== undefined 
      ? preset.settings.bgRemoval 
      : (preset.settings.backgroundRemoval ? preset.settings.backgroundRemoval.active : false)
    
    setBackgroundRemovalActive(targetBgRemovalActive)

    // Load compression suffix
    if (preset.settings.compress) setCompressSettings(preset.settings.compress)
    if (preset.settings.rename) setRenameSettings(preset.settings.rename)
    if (preset.settings.suffix !== undefined) setFilenameSuffix(preset.settings.suffix)
    
    // Guardrail: if background removal is active, output format CANNOT be JPG
    if (targetBgRemovalActive && preset.settings.convert.format === 'jpg') {
      setConvertSettings({
        ...preset.settings.convert,
        format: 'webp'
      })
      toast.success(`Loaded preset: ${preset.name} (Output format set to WebP for transparency)`)
    } else {
      setConvertSettings(preset.settings.convert)
      toast.success(`Loaded preset: ${preset.name}`)
    }
  }

  const deletePreset = (id) => {
    setPresets(presets.filter(p => p.id !== id))
    toast.info("Preset deleted")
  }

  const handleProcess = async (type) => {
    if (images.length === 0) {
      toast.error("No images loaded", { description: "Please upload or drop images first." })
      return
    }

    // Frictionless Free Trial Daily Gating
    const dailyFreeLimit = 10
    const isFreeTrial = !session || !isPro

    let processedToday = 0
    const todayStr = new Date().toDateString()

    if (isFreeTrial) {
      const savedDate = localStorage.getItem('optisnap_free_date')
      const savedCount = localStorage.getItem('optisnap_free_count')
      
      if (savedDate === todayStr) {
        processedToday = parseInt(savedCount || '0', 10)
      } else {
        // Reset count for new day
        localStorage.setItem('optisnap_free_date', todayStr)
        localStorage.setItem('optisnap_free_count', '0')
      }

      const remainingAllowance = dailyFreeLimit - processedToday

      if (remainingAllowance <= 0) {
        toast.custom((t) => (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid #ef4444',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '360px'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                Daily Limit Reached (10/10)
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                You have processed <b>10 free images today</b>. Upgrade to Pro in Settings to process unlimited files!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ), { duration: 8000 })

        setCurrentTab('settings')
        return
      }

      if (images.length > remainingAllowance) {
        toast.custom((t) => (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--primary)',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '360px'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--primary)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                Limit Exceeded
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                You have <b>{remainingAllowance} free image(s) left</b> for today, but tried to process {images.length}. Upgrade to Pro for unlimited files!
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ), { duration: 8000 })

        setCurrentTab('settings')
        return
      }
    }

    setIsProcessing(true)
    setProgress({ current: 0, total: images.length, percentage: 0, statusText: 'Initializing pipeline...' })

    const isDashboard = type === 'dashboard'
    const settings = {
      resize: { ...resizeSettings, active: isDashboard ? resizeSettings.active : type === 'resize' },
      watermark: { ...watermarkSettings, active: isDashboard ? watermarkSettings.active : type === 'watermark' },
      convert: { ...convertSettings, active: isDashboard ? convertSettings.active : (type === 'convert' || type === 'compress' || type === 'bg-removal') },
      rename: { ...renameSettings, active: type === 'rename' || (isDashboard && renameSettings.active) },
      compress: { ...compressSettings, active: isDashboard ? compressSettings.active : type === 'compress' },
      backgroundRemoval: { active: isDashboard ? backgroundRemovalActive : type === 'bg-removal' },
      suffix: filenameSuffix
    }

    const rawFiles = images.map(img => img.file)

    try {
      const result = await ImageProcessorService.processBatch(rawFiles, settings, (prog) => {
        setProgress(prog)
      })

      // Download the final zip blob
      const downloadUrl = URL.createObjectURL(result.zipBlob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `optisnap-batch-${Date.now()}.zip`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(downloadUrl)

      // Update productivity stats
      setStats(prev => {
        const next = {
          processedCount: (prev.processedCount || 0) + result.processedCount,
          timeSavedSeconds: (prev.timeSavedSeconds || 0) + (result.processedCount * 90),
          costSaved: (prev.costSaved || 0) + (result.processedCount * 0.15)
        }
        try {
          localStorage.setItem('optisnap_stats', JSON.stringify(next))
        } catch (e) {}

        if (session && session.user) {
          supabase.auth.updateUser({
            data: { stats: next }
          }).catch(err => console.warn("Failed to sync stats during batch", err))
        }

        return next
      })

      // Dynamic completion toast
      toast.custom((t) => (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          minWidth: '340px'
        }}>
          <div style={{
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Batch Finished!
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Successfully processed {result.processedCount} images into ZIP.
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}
          >
            ×
          </button>
        </div>
      ), { duration: 8000 })

      // Save new processed count for free trial users
      if (isFreeTrial) {
        const newCount = processedToday + result.processedCount
        localStorage.setItem('optisnap_free_count', newCount.toString())
      }

      if (result.errors.length > 0) {
        toast.warning(`Completed with ${result.errors.length} error(s). Check browser console.`)
      }

    } catch (error) {
      console.error(error)
      toast.error("Processing failed", { description: error.message })
    } finally {
      setIsProcessing(false)
      setProgress({ current: 0, total: 0, percentage: 0, statusText: '' })
    }
  }

  // Drag & drop handlers for main dashboard
  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)

  const onDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files)
    }
  }

  // Drag & drop handlers for watermark logo
  const onLogoDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingLogo(true)
  }
  const onLogoDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingLogo(false)
  }
  const onLogoDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingLogo(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (!file.type.startsWith('image/')) {
        toast.error("Please drop a valid image logo (PNG/JPG)")
        return
      }
      setWatermarkSettings({ ...watermarkSettings, logoFile: file })
      toast.success("Watermark logo loaded!")
    }
  }

  // Supabase Auth handler
  const handleAuth = async (e) => {
    e.preventDefault()
    
    if (authMode === 'signup' && !authUsername.trim()) {
      toast.error("Please enter a username.")
      return
    }
    if (!authEmail) {
      toast.error("Please enter your email address.")
      return
    }
    if (authMode !== 'forgot-password' && !authPassword) {
      toast.error("Please enter your password.")
      return
    }

    setAuthLoading(true)
    let toastId
    if (authMode === 'signup') {
      toastId = toast.loading("Creating account...")
    } else if (authMode === 'login') {
      toastId = toast.loading("Signing in...")
    } else if (authMode === 'forgot-password') {
      toastId = toast.loading("Sending recovery email...")
    }

    try {
      if (authMode === 'signup') {
        await SupabaseService.signUp(authEmail, authPassword, authUsername)
        toast.success("Signup successful! Verification link sent or ready to login.")
      } else if (authMode === 'login') {
        await SupabaseService.signIn(authEmail, authPassword)
        toast.success("Signed in successfully! 🚀")
      } else if (authMode === 'forgot-password') {
        await SupabaseService.sendPasswordResetEmail(authEmail)
        toast.success("Password reset link sent! Check your inbox. 📧")
        setAuthMode('login')
      }
      setAuthPassword('')
    } catch (err) {
      toast.error(err.message || "Authentication failed")
    } finally {
      if (toastId) toast.dismiss(toastId)
      setAuthLoading(false)
    }
  }

  // Handle setting a new password in password recovery flow
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPassword) {
      toast.error("Please enter a new password.")
      return
    }
    if (resetPassword !== confirmResetPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setAuthLoading(true)
    const toastId = toast.loading("Updating password...")
    try {
      await SupabaseService.updatePassword(resetPassword)
      toast.success("Password updated successfully! 🚀")
      setResetPassword('')
      setConfirmResetPassword('')
      setView('app')
      setCurrentTab('dashboard')
    } catch (err) {
      toast.error(err.message || "Failed to update password")
    } finally {
      toast.dismiss(toastId)
      setAuthLoading(false)
    }
  }

  // Supabase License activation handler
  const handleActivateLicense = async () => {
    if (!promoCode) return toast.error("Please enter a promo code.")

    const toastId = toast.loading("Verifying AppSumo Code...")
    try {
      const result = await SupabaseService.activateLicenseCode(promoCode)
      if (result.success) {
        setIsPro(true)
        toast.success("AppSumo Lifetime Deal Activated! Pro features unlocked. 🚀")
        setPromoCode('')
      }
    } catch (err) {
      toast.error(err.message || "Failed to activate code.")
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleSignOut = async () => {
    try {
      await SupabaseService.signOut()
      setSession(null)
      setIsPro(false)
      toast.info("Signed out successfully.")
    } catch (e) {
      toast.error("Signout error")
    }
  }

  // Load and refresh admin code registry
  const loadAdminCodes = async () => {
    setAdminLoading(true)
    try {
      const data = await SupabaseService.getAdminLicenseCodes()
      setAdminCodes(data || [])
    } catch (e) {
      console.error("Failed to load codes:", e)
      toast.error(`Database Error: ${e.message || "Failed to fetch license registry."}`)
    } finally {
      setAdminLoading(false)
    }
  }

  // Generate a batch of unique AppSumo license codes
  const handleGenerateCodes = async () => {
    if (!generatePrefix) return toast.error("Please enter a prefix (e.g. OPTSNP-)")
    if (!generateCount || generateCount <= 0 || generateCount > 1000) {
      return toast.error("Please enter a code count between 1 and 1000.")
    }

    const toastId = toast.loading(`Generating ${generateCount} keys...`)
    try {
      await SupabaseService.generateLicenseCodes(generateCount, generatePrefix)
      toast.success(`Successfully generated ${generateCount} license keys! 🚀`)
      loadAdminCodes()
    } catch (e) {
      toast.error(e.message || "Failed to generate keys. Make sure database tables exist.")
      console.error(e)
    } finally {
      toast.dismiss(toastId)
    }
  }

  // Download filtered keys as CSV
  const handleDownloadCSV = () => {
    if (adminCodes.length === 0) {
      return toast.error("No license keys found to download.")
    }

    const filtered = adminCodes.filter(c => 
      c.code.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
      (c.profiles?.email && c.profiles.email.toLowerCase().includes(adminSearchQuery.toLowerCase()))
    )

    let csvContent = "data:text/csv;charset=utf-8," 
      + "License Code,Status,Activated At,User Email\n"
      + filtered.map(c => {
          const status = c.is_used ? "Used" : "Unused"
          const date = c.activated_at ? new Date(c.activated_at).toLocaleString() : ""
          const email = c.profiles?.email || ""
          return `"${c.code}","${status}","${date}","${email}"`
        }).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `optisnap_appsumo_keys_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("License keys downloaded as CSV! 📄")
  }

  // Revoke an active license key and demote the user
  const handleRevokeKey = async (code) => {
    if (!window.confirm(`Are you sure you want to revoke key "${code}"? This will demote the user profile to Free status immediately.`)) {
      return
    }

    const toastId = toast.loading(`Revoking license key...`)
    try {
      await SupabaseService.revokeLicenseCode(code)
      toast.success("License key revoked and user demoted successfully! 🔓")
      loadAdminCodes()
    } catch (e) {
      toast.error(e.message || "Failed to revoke key.")
      console.error(e)
    } finally {
      toast.dismiss(toastId)
    }
  }

  // Delete a license key entirely from the database
  const handleDeleteKey = async (code, isUsed) => {
    const message = isUsed 
      ? `WARNING: This key is currently active! Deleting it will demote the active user and delete the key permanently from the database. Continue?`
      : `Are you sure you want to delete license key "${code}" permanently?`

    if (!window.confirm(message)) {
      return
    }

    const toastId = toast.loading(`Deleting license key...`)
    try {
      await SupabaseService.deleteLicenseCode(code)
      toast.success("License key deleted successfully! 🗑️")
      loadAdminCodes()
    } catch (e) {
      toast.error(e.message || "Failed to delete key.")
      console.error(e)
    } finally {
      toast.dismiss(toastId)
    }
  }

  // Load codes whenever admin opens the panel
  useEffect(() => {
    if (session && currentTab === 'admin') {
      loadAdminCodes()
    }
  }, [session, currentTab])

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="card dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Upload Products</h2>

              <div className="preset-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Platform:</span>
                <CustomSelect
                  options={presets.map(p => ({ value: p.id, label: p.name }))}
                  value={selectedPresetId}
                  onChange={(val) => {
                    const pid = parseInt(val)
                    if (pid) {
                      loadPreset(presets.find(p => p.id === pid))
                      setSelectedPresetId(pid)
                    }
                  }}
                  placeholder="Select Platform..."
                />
              </div>
            </div>

            <div
              className={`drop-zone ${isDragging ? 'active' : ''}`}
              onClick={handleSelectFiles}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div style={{ pointerEvents: 'none' }}>
                <FolderOpen size={48} color={isDragging ? '#864DE2' : '#ccc'} style={{ marginBottom: '15px' }} />
                {images.length > 0 ? (
                  <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Loaded: {images.length} {images.length === 1 ? 'Image' : 'Images'}</p>
                ) : (
                  <>
                    <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-main)' }}>Click to select images</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>or drag and drop images here</p>
                  </>
                )}
              </div>
            </div>

            {/* Active Settings Master Control Panel */}
            <div style={{
              marginTop: '24px',
              padding: '12px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              transition: 'all 0.3s ease'
            }} className="dashboard-settings-summary">
              {/* Resize Card */}
              <div
                onClick={() => setResizeSettings({ ...resizeSettings, active: !resizeSettings.active })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: resizeSettings.active ? 'var(--bg-card)' : 'transparent',
                  border: resizeSettings.active ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: resizeSettings.active ? 'var(--shadow-sm)' : 'none'
                }}
                className="master-control-item"
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{
                    background: resizeSettings.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                    color: resizeSettings.active ? 'var(--primary)' : 'var(--text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Scaling size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Resize Rules</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {resizeSettings.active ? `${resizeSettings.width || 'Auto'}x${resizeSettings.height || 'Auto'} (${resizeSettings.mode})` : 'Disabled'}
                    </span>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <div style={{
                  width: '28px',
                  height: '16px',
                  background: resizeSettings.active ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: resizeSettings.active ? '14px' : '2px',
                    transition: 'left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* AI Background Removal Card */}
              <div
                onClick={() => setBackgroundRemovalActive(!backgroundRemovalActive)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: backgroundRemovalActive ? 'var(--bg-card)' : 'transparent',
                  border: backgroundRemovalActive ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: backgroundRemovalActive ? 'var(--shadow-sm)' : 'none'
                }}
                className="master-control-item"
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{
                    background: backgroundRemovalActive ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                    color: backgroundRemovalActive ? 'var(--primary)' : 'var(--text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI Background</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {backgroundRemovalActive ? 'Enabled (Secure AI)' : 'Disabled'}
                    </span>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <div style={{
                  width: '28px',
                  height: '16px',
                  background: backgroundRemovalActive ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: backgroundRemovalActive ? '14px' : '2px',
                    transition: 'left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* Watermark Card */}
              <div
                onClick={() => setWatermarkSettings({ ...watermarkSettings, active: !watermarkSettings.active })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: watermarkSettings.active ? 'var(--bg-card)' : 'transparent',
                  border: watermarkSettings.active ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: watermarkSettings.active ? 'var(--shadow-sm)' : 'none'
                }}
                className="master-control-item"
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{
                    background: watermarkSettings.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                    color: watermarkSettings.active ? 'var(--primary)' : 'var(--text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Stamp size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Watermark</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {watermarkSettings.active ? `${watermarkSettings.type} (${watermarkSettings.position})` : 'Disabled'}
                    </span>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <div style={{
                  width: '28px',
                  height: '16px',
                  background: watermarkSettings.active ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: watermarkSettings.active ? '14px' : '2px',
                    transition: 'left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* SEO Rename Card */}
              <div
                onClick={() => setRenameSettings({ ...renameSettings, active: !renameSettings.active })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: renameSettings.active ? 'var(--bg-card)' : 'transparent',
                  border: renameSettings.active ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: renameSettings.active ? 'var(--shadow-sm)' : 'none'
                }}
                className="master-control-item"
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{
                    background: renameSettings.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                    color: renameSettings.active ? 'var(--primary)' : 'var(--text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FilePenLine size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>SEO Rename</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {renameSettings.active ? `${renameSettings.baseName || 'image'}-[seq]` : 'Disabled'}
                    </span>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <div style={{
                  width: '28px',
                  height: '16px',
                  background: renameSettings.active ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: renameSettings.active ? '14px' : '2px',
                    transition: 'left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* Compression Card */}
              <div
                onClick={() => setCompressSettings({ ...compressSettings, active: !compressSettings.active })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: compressSettings.active ? 'var(--bg-card)' : 'transparent',
                  border: compressSettings.active ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: compressSettings.active ? 'var(--shadow-sm)' : 'none'
                }}
                className="master-control-item"
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{
                    background: compressSettings.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                    color: compressSettings.active ? 'var(--primary)' : 'var(--text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Minimize2 size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Compression</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {compressSettings.active ? `< ${compressSettings.maxSizeMB || 1.0}MB` : 'Disabled'}
                    </span>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <div style={{
                  width: '28px',
                  height: '16px',
                  background: compressSettings.active ? 'var(--primary)' : 'var(--border-color)',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: compressSettings.active ? '14px' : '2px',
                    transition: 'left 0.2s'
                  }}></div>
                </div>
              </div>
            </div>

            {images.length > 0 && backgroundRemovalActive && convertSettings.format === 'jpg' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '20px',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                lineHeight: 1.4
              }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div style={{ flexGrow: 1 }}>
                  <strong>Transparency Warning:</strong> You have active background removal, but the output format is set to <strong>JPG</strong>. JPG files do not support transparent backgrounds (they will turn white/black). We recommend using <strong>WEBP</strong> or <strong>PNG</strong>.
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setConvertSettings({ ...convertSettings, format: 'webp' })
                      toast.success("Output format fixed to WebP! 🚀")
                    }}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Fix to WebP
                  </button>
                  <button
                    onClick={() => {
                      setConvertSettings({ ...convertSettings, format: 'png' })
                      toast.success("Output format fixed to PNG! 🚀")
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Fix to PNG
                  </button>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="action-bar" style={{ marginTop: '20px', padding: '20px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{images.length} {images.length === 1 ? 'Image' : 'Images'} Ready</h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Process will apply <b>active tab configs</b>. Files download as a single <b>ZIP archive</b>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '12px 20px', fontSize: '14px', borderColor: '#ff4d4d', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      setImages([])
                      toast.info("Selection Cleared")
                    }}
                    disabled={isProcessing}
                  >
                    <Trash2 size={16} /> Clear
                  </button>
                  <button className="btn-primary" style={{ padding: '12px 30px', fontSize: '16px' }} onClick={() => handleProcess('dashboard')} disabled={isProcessing}>
                    Start Processing
                  </button>
                </div>
              </div>
            )}

            <div className="image-grid" style={{ marginTop: '30px' }}>
              {images.slice(0, 48).map((img, idx) => (
                <div key={img.id} className="image-thumbnail" style={{ position: 'relative' }}>
                  <img src={img.previewUrl} alt="thumbnail" loading="lazy" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      const newImages = [...images]
                      URL.revokeObjectURL(newImages[idx].previewUrl)
                      newImages.splice(idx, 1)
                      setImages(newImages)
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      opacity: 0.8,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                    title="Remove Image"
                  >
                    ×
                  </div>
                </div>
              ))}
              {images.length > 48 && (
                <div className="image-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  +{images.length - 48} more
                </div>
              )}
            </div>

            <div className="destination-box" style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="section-desc" style={{ fontSize: '13px', margin: 0 }}>
                Output Mode: Packaged into single-click downloadable ZIP archive.
              </p>
            </div>

            {/* Impact & Savings Analytics Dashboard */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.04) 0%, rgba(134, 77, 226, 0.08) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Your OptiSnap Impact</h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                {/* Metric 1 */}
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(134, 77, 226, 0.1)',
                    color: 'var(--primary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Processed Images</span>
                    <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.processedCount || 0}
                    </strong>
                  </div>
                </div>

                {/* Metric 2 */}
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Hourglass size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Time Saved</span>
                    <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stats.timeSavedSeconds ? (
                        stats.timeSavedSeconds < 60 ? (
                          `${stats.timeSavedSeconds}s`
                        ) : stats.timeSavedSeconds < 3600 ? (
                          `${Math.round(stats.timeSavedSeconds / 60)}m`
                        ) : (
                          `${(stats.timeSavedSeconds / 3600).toFixed(1)}h`
                        )
                      ) : '0m'}
                    </strong>
                  </div>
                </div>

                {/* Metric 3 */}
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Coins size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Estimated Savings</span>
                    <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      ${(stats.costSaved || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'resize':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Bulk Resize</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={resizeSettings.active}
                  onChange={e => setResizeSettings({ ...resizeSettings, active: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: resizeSettings.active ? 1 : 0.4, pointerEvents: resizeSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <p className="helper-text" style={{ marginBottom: '20px' }}>
                Define your target dimensions and container fit mode. Ideal for product standardization.
              </p>
              <div className="form-group">
                <label>Width (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={resizeSettings.width}
                  onChange={e => setResizeSettings({ ...resizeSettings, width: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Height (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  value={resizeSettings.height}
                  onChange={e => setResizeSettings({ ...resizeSettings, height: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Resize Mode</label>
                <select
                  value={resizeSettings.mode}
                  onChange={e => setResizeSettings({ ...resizeSettings, mode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="inside">Fit Inside (No Crop, No Stretch)</option>
                  <option value="cover">Cover (Fill & Crop) - Best for Catalogs</option>
                  <option value="contain">Contain (Fit w/ Padding)</option>
                  <option value="fill">Stretch (Distort)</option>
                </select>
              </div>

              {resizeSettings.mode === 'contain' && (
                <div className="form-group" style={{ padding: '15px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Padding Type</label>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="bgMode"
                        checked={resizeSettings.bgMode === 'solid'}
                        onChange={() => setResizeSettings({ ...resizeSettings, bgMode: 'solid' })}
                      />
                      Solid Color
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="bgMode"
                        checked={resizeSettings.bgMode === 'blur'}
                        onChange={() => setResizeSettings({ ...resizeSettings, bgMode: 'blur' })}
                      />
                      Blurred Original (Premium)
                    </label>
                  </div>
                  {resizeSettings.bgMode === 'solid' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>Solid Background Color:</span>
                      <input
                        type="color"
                        value={resizeSettings.bgColor || '#ffffff'}
                        onChange={e => setResizeSettings({ ...resizeSettings, bgColor: e.target.value })}
                        style={{ border: 'none', padding: 0, width: '40px', height: '30px', cursor: 'pointer', background: 'none' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{resizeSettings.bgColor || '#ffffff'}</span>
                    </div>
                  )}
                </div>
              )}

              <button className="btn-primary" onClick={() => handleProcess('resize')} disabled={isProcessing}>
                Start Resize Batch
              </button>

              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-main)', borderRadius: '6px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}>Active Config Overview:</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {(!resizeSettings.width && !resizeSettings.height) ? (
                    "No dimensions specified. Output images will preserve original size."
                  ) : (
                    <>
                      Images will resize to
                      {resizeSettings.width && !resizeSettings.height && <span> <b>width {resizeSettings.width}px</b> (auto height).</span>}
                      {!resizeSettings.width && resizeSettings.height && <span> <b>height {resizeSettings.height}px</b> (auto width).</span>}
                      {resizeSettings.width && resizeSettings.height && (
                        <span> <b>{resizeSettings.width}x{resizeSettings.height}px</b>.
                          {resizeSettings.mode === 'inside' && " Aspect ratio preserved (no padding/cropping)."}
                          {resizeSettings.mode === 'cover' && " Aspect ratio preserved with cropping to fill dimensions."}
                          {resizeSettings.mode === 'fill' && " Stretched to fit layout."}
                          {resizeSettings.mode === 'contain' && ` Aspect ratio preserved, padded via ${resizeSettings.bgMode === 'blur' ? 'Blurred Background' : `Solid Color (${resizeSettings.bgColor || '#ffffff'})`}.`}
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      case 'bg-removal':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>AI Background Removal</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={backgroundRemovalActive}
                  onChange={e => setBackgroundRemovalActive(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: backgroundRemovalActive ? 1 : 0.4, pointerEvents: backgroundRemovalActive ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <p className="helper-text" style={{ marginBottom: '20px' }}>
                Securely isolate and extract subjects from your catalog photos. Runs inside your isolated session sandbox with zero image uploads.
              </p>

              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.02) 0%, rgba(134, 77, 226, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    background: 'rgba(134, 77, 226, 0.1)',
                    color: 'var(--primary)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      Private Edge Processing
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Your product images never leave your secure session sandbox. Processing operates in a private, high-speed isolated pipeline, ensuring maximum confidentiality, zero network upload delays, and <strong>unlimited lifetime processing without recurring per-image credit fees</strong>.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>💡 Performance Guidelines:</span> Best suited for catalog shots, products, and clean backgrounds. For ultra-complex details (such as models with fine hair or complex textures), server-based pipelines may produce sharper extractions, but require recurring per-image fees.
                </div>
              </div>

              {backgroundRemovalActive && convertSettings.format === 'jpg' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '20px',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  lineHeight: 1.4
                }}>
                  <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>
                    <strong>Format Mismatch:</strong> JPG output format does not support transparency. Please switch to <strong>WebP</strong> or <strong>PNG</strong> to keep transparent backgrounds.
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setConvertSettings({ ...convertSettings, format: 'webp' })
                        toast.success("Output format fixed to WebP! 🚀")
                      }}
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: '11px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Use WebP
                    </button>
                    <button
                      onClick={() => {
                        setConvertSettings({ ...convertSettings, format: 'png' })
                        toast.success("Output format fixed to PNG! 🚀")
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Use PNG
                    </button>
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={() => handleProcess('bg-removal')} disabled={isProcessing}>
                Start Background Removal Batch
              </button>
            </div>
          </div>
        )
      case 'watermark':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Watermark Settings</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={watermarkSettings.active}
                  onChange={e => setWatermarkSettings({ ...watermarkSettings, active: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: watermarkSettings.active ? 1 : 0.4, pointerEvents: watermarkSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="wmType"
                    checked={watermarkSettings.type === 'text'}
                    onChange={() => setWatermarkSettings({ ...watermarkSettings, type: 'text' })}
                  />
                  <span style={{ fontWeight: 500 }}>Text Watermark</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="wmType"
                    checked={watermarkSettings.type === 'image'}
                    onChange={() => setWatermarkSettings({ ...watermarkSettings, type: 'image' })}
                  />
                  <span style={{ fontWeight: 500 }}>Logo Image Overlay</span>
                </label>
              </div>

              {watermarkSettings.type === 'text' ? (
                <div className="form-group">
                  <label>Watermark Text</label>
                  <input type="text" value={watermarkSettings.text} onChange={e => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload Logo (PNG Recommended)</label>
                  <div
                    style={{
                      background: isDraggingLogo ? 'rgba(134, 77, 226, 0.1)' : 'var(--input-bg)',
                      padding: '20px',
                      borderRadius: '8px',
                      border: isDraggingLogo ? '2px dashed var(--primary)' : '1px dashed var(--input-border)',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onDragOver={onLogoDragOver}
                    onDragLeave={onLogoDragLeave}
                    onDrop={onLogoDrop}
                    onClick={() => document.getElementById('logo-upload').click()}
                  >
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          setWatermarkSettings({ ...watermarkSettings, logoFile: e.target.files[0] })
                          toast.success("Logo Selected")
                        }
                      }}
                    />
                    <button className="btn-secondary" style={{ pointerEvents: 'none' }}>
                      <UploadCloud size={16} /> Choose Logo File
                    </button>
                    {watermarkSettings.logoFile ? (
                      <p style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
                        Selected: <b>{watermarkSettings.logoFile.name}</b>
                      </p>
                    ) : (
                      <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {isDraggingLogo ? "Drop it!" : "or Drag & Drop logo here"}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                      Logo resized to 20% width of output container automatically.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label>Opacity / Transparency</label>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{Math.round(watermarkSettings.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={watermarkSettings.opacity}
                  onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Position</label>
                <select value={watermarkSettings.position} onChange={e => setWatermarkSettings({ ...watermarkSettings, position: e.target.value })}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <button className="btn-primary" onClick={() => handleProcess('watermark')} disabled={isProcessing}>
                Start Watermark Batch
              </button>
            </div>
          </div>
        )
      case 'rename':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Bulk Rename (SEO)</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={renameSettings.active}
                  onChange={e => setRenameSettings({ ...renameSettings, active: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: renameSettings.active ? 1 : 0.4, pointerEvents: renameSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Standardize target filenames for optimized SEO rankings (e.g. `product-keyword-01.jpg`).
              </p>

              <div className="form-group">
                <label>Base Filename</label>
                <input
                  type="text"
                  placeholder="e.g. spring-organic-shirt"
                  value={renameSettings.baseName}
                  onChange={e => setRenameSettings({ ...renameSettings, baseName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Start Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={renameSettings.startSeq}
                  onChange={e => setRenameSettings({ ...renameSettings, startSeq: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div style={{ marginTop: '20px', padding: '10px', background: 'var(--input-bg)', borderRadius: '6px', fontSize: '12px' }}>
                Preview Format: <b>{renameSettings.baseName || 'image'}-{renameSettings.startSeq}.jpg</b>
              </div>

              <br />
              <button className="btn-primary" onClick={() => handleProcess('rename')} disabled={isProcessing}>
                Start Rename Batch
              </button>
            </div>
          </div>
        )
      case 'compress':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Lossless File Compression</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={compressSettings.active}
                  onChange={e => setCompressSettings({ ...compressSettings, active: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: compressSettings.active ? 1 : 0.4, pointerEvents: compressSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <p className="helper-text" style={{ marginBottom: '20px' }}>
                Further minify output image sizes instantly. Smaller images load faster and improve Etsy/Shopify SEO search rankings.
              </p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>Max Target Size (MB)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={compressSettings.maxSizeMB}
                  onChange={e => setCompressSettings({ ...compressSettings, maxSizeMB: parseFloat(e.target.value) || 1.0 })}
                  style={{ marginTop: '5px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--input-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <Minimize2 size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Web-Optimized Compression</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Runs high-speed parallel optimization routines to reduce file size with maximum quality preservation.
                  </p>
                </div>
              </div>

              <button className="btn-primary" onClick={() => handleProcess('compress')} disabled={isProcessing}>
                Start Compression Batch
              </button>
            </div>
          </div>
        )
      case 'convert':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Format Conversion</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={convertSettings.active}
                  onChange={e => setConvertSettings({ ...convertSettings, active: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: convertSettings.active ? 1 : 0.4, pointerEvents: convertSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <div className="form-group">
                <label>Output Format</label>
                <select value={convertSettings.format} onChange={e => setConvertSettings({ ...convertSettings, format: e.target.value })}>
                  <option value="jpg">JPG (Standard Compatibility)</option>
                  <option value="png">PNG (Lossless / Transparent)</option>
                  <option value="webp">WEBP (Modern Web Compressed)</option>
                  <option value="avif">AVIF (Next-Gen Compressed)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quality ({convertSettings.quality}%)</label>
                <input type="range" min="1" max="100" value={convertSettings.quality} onChange={e => setConvertSettings({ ...convertSettings, quality: parseInt(e.target.value) || 90 })} />
              </div>

              <button className="btn-primary" onClick={() => handleProcess('convert')} disabled={isProcessing}>
                Start Conversion Batch
              </button>
            </div>
          </div>
        )
      case 'admin':
        if (!session || session.user.email !== 'arham.ashfaqft@gmail.com') {
          return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ShieldAlert size={48} color="#ff4d4d" style={{ marginBottom: '16px' }} />
              <h3>Access Denied</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                You do not have administrative permissions to access this control portal.
              </p>
              <button className="btn-primary" onClick={() => setCurrentTab('dashboard')}>
                Go to Dashboard
              </button>
            </div>
          )
        }

        const totalKeys = adminCodes.length
        const usedKeys = adminCodes.filter(c => c.is_used).length
        const unusedKeys = totalKeys - usedKeys
        const usedRate = totalKeys > 0 ? Math.round((usedKeys / totalKeys) * 100) : 0

        const filteredCodes = adminCodes.filter(c => {
          const matchesSearch = c.code.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
            (c.profiles?.email && c.profiles.email.toLowerCase().includes(adminSearchQuery.toLowerCase()))
          
          const matchesFilter = adminStatusFilter === 'all' ||
            (adminStatusFilter === 'used' && c.is_used) ||
            (adminStatusFilter === 'unused' && !c.is_used)
            
          return matchesSearch && matchesFilter
        })

        return (
          <div className="card admin-portal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={24} color="var(--primary)" /> Admin Control Portal
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Generate, track, and manage AppSumo lifetime license codes securely.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={loadAdminCodes} disabled={adminLoading} title="Refresh code list" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={16} className={adminLoading ? 'animate-spin' : ''} /> Refresh Registry
                </button>
                <button className="btn-primary" onClick={handleDownloadCSV} disabled={adminCodes.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} /> Export to AppSumo (CSV)
                </button>
              </div>
            </div>

            {/* Admin Stats Dashboard Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '30px'
            }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Total License Keys</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>{totalKeys}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', fontWeight: 600 }}>Unused (Remaining)</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>{unusedKeys}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 600 }}>Used (Activated)</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>{usedKeys}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Activation Rate</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>{usedRate}%</div>
              </div>
            </div>

            {/* Generator Console */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.02) 0%, rgba(134, 77, 226, 0.05) 100%)',
              border: '1px solid rgba(134, 77, 226, 0.2)',
              borderRadius: '16px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--primary)" /> Generate New AppSumo License Keys
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Create batches of cryptographically unique, non-duplicable lifetime license keys that will instantly be recognized by the app.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Code Prefix</label>
                  <input
                    type="text"
                    value={generatePrefix}
                    onChange={e => setGeneratePrefix(e.target.value.toUpperCase())}
                    placeholder="e.g. OPTSNP-"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                
                <div style={{ width: '140px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quantity to Generate</label>
                  <input
                    type="number"
                    value={generateCount}
                    onChange={e => setGenerateCount(parseInt(e.target.value) || 0)}
                    min="1"
                    max="1000"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <button className="btn-primary" onClick={handleGenerateCodes} style={{ height: '42px', padding: '0 24px' }}>
                  Generate & Save Keys
                </button>
              </div>
            </div>

            {/* List & Search section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Active License Key Registry</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Status filter */}
                  <select
                    value={adminStatusFilter}
                    onChange={e => setAdminStatusFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="unused">Unused Only</option>
                    <option value="used">Used Only</option>
                  </select>

                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search by key or email..."
                      value={adminSearchQuery}
                      onChange={e => setAdminSearchQuery(e.target.value)}
                      style={{ width: '100%', paddingLeft: '36px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-card)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>License Key</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Activated By</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Activation Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminLoading ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px auto' }} />
                          Loading registry database...
                        </td>
                      </tr>
                    ) : filteredCodes.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          No matching license keys found.
                        </td>
                      </tr>
                    ) : (
                      filteredCodes.map(c => (
                        <tr key={c.code} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="admin-table-row">
                          <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-main)' }}>{c.code}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                              background: c.is_used ? 'rgba(134, 77, 226, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: c.is_used ? 'var(--primary)' : '#10b981',
                              border: c.is_used ? '1px solid rgba(134, 77, 226, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                              {c.is_used ? 'Used' : 'Unused'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.profiles?.email || '-'}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                            {c.activated_at ? new Date(c.activated_at).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {c.is_used && (
                              <button
                                onClick={() => handleRevokeKey(c.code)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: 'rgba(134, 77, 226, 0.08)',
                                  color: 'var(--primary)',
                                  border: '1px solid rgba(134, 77, 226, 0.15)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  marginRight: '8px',
                                  transition: 'all 0.2s'
                                }}
                                title="Revoke key and set user to free status"
                              >
                                Revoke
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteKey(c.code, c.is_used)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: 'rgba(255, 77, 77, 0.08)',
                                color: '#ff4d4d',
                                border: '1px solid rgba(255, 77, 77, 0.15)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Delete key permanently"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="card">
            <h2>Account Settings</h2>

            {/* Supabase Authentication Section */}
            <div className="section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
              <h3>{session ? "Profile Status" : "Authentication Required"}</h3>
              {session ? (
                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    Logged in as: <b>{session.user.user_metadata?.display_name || session.user.email}</b>
                    {session.user.user_metadata?.display_name && <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginTop: '2px' }}>({session.user.email})</span>}
                  </p>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                    Plan Status: <span className={isPro ? 'text-pro' : ''} style={{ fontWeight: 700 }}>{isPro ? '🚀 PRO Lifetime Deal Active' : 'FREE Basic Mode'}</span>
                  </p>
                  
                  {!isPro && (
                    <div className="form-group" style={{ padding: '15px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                      <label style={{ fontWeight: 600 }}>Activate AppSumo Key</label>
                      <p className="helper-text" style={{ marginBottom: '10px' }}>Paste your AppSumo license key below to unlock limitless processing.</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          value={promoCode}
                          onChange={e => setPromoCode(e.target.value)}
                          placeholder="AS-XXXXX..."
                        />
                        <button className="btn-primary" onClick={handleActivateLicense}>Activate</button>
                      </div>
                    </div>
                  )}

                  <button className="btn-secondary" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', borderColor: '#ff4d4d' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.03) 0%, rgba(134, 77, 226, 0.06) 100%)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  maxWidth: '500px'
                }}>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Sign in or create an account to save custom platform presets, activate your lifetime license keys, and unlock unlimited bulk image processing.
                  </p>
                  <button
                    onClick={() => setView('auth')}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}
                  >
                    Go to Login / Sign Up Page
                  </button>
                </div>
              )}
            </div>

            {/* Appearance Section */}
            <div className="section mt-4" style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3>Appearance Settings</h3>
              <button className="btn-secondary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </button>
            </div>



            {/* Settings Preferences */}
            <div className="section mt-4" style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3>Global Preferences</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Filename Suffix</label>
                <p className="helper-text">Suffix appended to non-renamed outputs (e.g. `photo_processed.png`)</p>
                <input type="text" value={filenameSuffix} onChange={e => setFilenameSuffix(e.target.value)} />
              </div>
            </div>

            {/* Saved Presets */}
            <div className="section mt-4" style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3>Saved Configuration Presets</h3>
              <p className="helper-text" style={{ marginBottom: '15px' }}>Store current canvas, watermarking, and conversion preferences into local storage.</p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Preset Name (e.g. Shopify Standard)"
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                />
                <button className="btn-primary" onClick={savePreset}><Save size={16} /> Save Active</button>
              </div>

              <div className="presets-list">
                {presets.filter(p => !p.isDefault).length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No custom presets stored yet.</p>}
                {presets.filter(p => !p.isDefault).map(preset => (
                  <div key={preset.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'var(--input-bg)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid var(--input-border)'
                  }}>
                    <span style={{ fontWeight: 500 }}>{preset.name}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" onClick={() => loadPreset(preset)} title="Load Preset">Load</button>
                      <button className="btn-secondary" style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }} onClick={() => deletePreset(preset.id)} title="Delete">x</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <p>OptiSnap Web SaaS v1.0.0</p>
              <p>© 2026 OptiSnap Inc.</p>
            </div>
          </div>
        )
      default:
        return <div>Select a tab</div>
    }
  }

  if (view === 'landing') {
    return (
      <>
        <Toaster position="top-center" richColors theme={theme} />
        <LandingPage
          onLaunchApp={(targetTab) => {
            const tab = typeof targetTab === 'string' ? targetTab : 'dashboard';
            if (tab === 'settings') {
              if (!session) {
                setView('auth')
              } else {
                setView('app')
                setCurrentTab('settings')
              }
            } else {
              setView('app')
              setCurrentTab(tab)
            }
          }}
          session={session}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </>
    )
  }

  if (view === 'auth') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <Toaster position="top-center" richColors theme={theme} />
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px',
          animation: 'fadeIn 0.3s ease-out',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <img src={icon} alt="Logo" style={{ width: '40px', height: '40px' }} />
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>OptiSnap</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>
            {authMode === 'login' && "Welcome Back"}
            {authMode === 'signup' && "Create your Account"}
            {authMode === 'forgot-password' && "Forgot Password?"}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 30px 0', lineHeight: 1.5 }}>
            {authMode === 'login' && "Sign in to activate your features and manage your batch settings."}
            {authMode === 'signup' && "Sign up to start saving presets and bulk processing product catalogs."}
            {authMode === 'forgot-password' && "Enter your email address and we'll send you a password recovery link."}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
            {authMode === 'signup' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Username / Display Name</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  required
                  style={{
                    width: '100%',
                    display: 'block',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={{
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '13px'
                }}
              />
            </div>

            {authMode !== 'forgot-password' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot-password')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    display: 'block',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }} disabled={authLoading}>
              {authLoading ? "Please wait..." : (
                authMode === 'login' ? "Log In" : (
                  authMode === 'signup' ? "Sign Up" : "Send Reset Link"
                )
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              {authMode === 'login' && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Sign Up
                  </button>
                </span>
              )}
              {authMode === 'signup' && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Log In
                  </button>
                </span>
              )}
              {authMode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '12px' }}
                >
                  Back to Log In
                </button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '24px 0' }} />

          {/* Sandbox Bypass Mode */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(134, 77, 226, 0.04)',
            border: '1px dashed rgba(134, 77, 226, 0.25)',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
              🔑 Sandbox Demo Mode
            </h4>
            <p className="helper-text" style={{ margin: '0 0 12px 0', fontSize: '11px', lineHeight: 1.4 }}>
              Supabase environment keys are not configured yet. You can bypass authentication and activate all Pro features immediately for local testing.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => {
                setSession({
                  user: {
                    email: 'sandbox@optisnap.app',
                    id: 'sandbox-mock-id-12345'
                  }
                })
                setIsPro(true)
                toast.success("Sandbox mode active! All Pro features unlocked. 🚀")
                setView('app')
                setCurrentTab('dashboard')
              }}
            >
              Bypass & Run Demo Session
            </button>
          </div>

          <button
            onClick={() => setView('landing')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} /> Back to Website
          </button>
        </div>
      </div>
    )
  }

  if (view === 'reset-password') {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <Toaster position="top-center" richColors theme={theme} />
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px',
          animation: 'fadeIn 0.3s ease-out',
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <img src={icon} alt="Logo" style={{ width: '40px', height: '40px' }} />
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>OptiSnap</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>
            Set New Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 30px 0', lineHeight: 1.5 }}>
            Please enter and confirm your new account password below.
          </p>

          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>New Password</label>
              <input
                type="password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmResetPassword}
                onChange={e => setConfirmResetPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '13px'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }} disabled={authLoading}>
              {authLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Toaster position="top-center" richColors theme={theme} />

      {isProcessing && (
        <div className="progress-overlay">
          <div className="spinner-box">
            <Loader2 className="animate-spin" size={40} color="#864DE2" />
            <p>Processing Batch...</p>
            {progress.total > 0 && (
              <div style={{ marginTop: '10px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ marginBottom: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {progress.current} of {progress.total}
                </p>
                <div style={{ width: '250px', height: '6px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${progress.percentage}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }}></div>
                </div>
                {progress.statusText && (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {progress.statusText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="logo" onClick={() => setView('landing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }} title="Back to Landing Page">
          <img src={icon} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>OptiSnap</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isPro ? 'var(--primary)' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1
            }}>
              {isPro ? '★ Pro Lifetime' : 'Free Trial'}
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className={currentTab === 'dashboard' ? 'active' : ''} onClick={() => setCurrentTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={currentTab === 'resize' ? 'active' : ''} onClick={() => setCurrentTab('resize')}>
            <Scaling size={18} /> Resize
          </button>
          <button className={currentTab === 'bg-removal' ? 'active' : ''} onClick={() => setCurrentTab('bg-removal')}>
            <Sparkles size={18} /> BG Removal
          </button>
          <button className={currentTab === 'watermark' ? 'active' : ''} onClick={() => setCurrentTab('watermark')}>
            <Stamp size={18} /> Watermark
          </button>
          <button className={currentTab === 'rename' ? 'active' : ''} onClick={() => setCurrentTab('rename')}>
            <FilePenLine size={18} /> Rename
          </button>
          <button className={currentTab === 'compress' ? 'active' : ''} onClick={() => setCurrentTab('compress')}>
            <Minimize2 size={18} /> Compress
          </button>
          <button className={currentTab === 'convert' ? 'active' : ''} onClick={() => setCurrentTab('convert')}>
            <FileType size={18} /> Convert
          </button>
          <div className="divider"></div>
          <button className={currentTab === 'settings' ? 'active' : ''} onClick={() => setCurrentTab('settings')}>
            <Settings size={18} /> Settings
          </button>
          {session && session.user.email === 'arham.ashfaqft@gmail.com' && (
            <button className={currentTab === 'admin' ? 'active' : ''} onClick={() => setCurrentTab('admin')} style={{ color: 'var(--primary)' }}>
              <ShieldAlert size={18} /> Admin Portal
            </button>
          )}
        </nav>

        {/* Sidebar Footer Section */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          width: '100%'
        }}>
          {session && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              background: 'linear-gradient(135deg, rgba(134, 77, 226, 0.04) 0%, rgba(134, 77, 226, 0.01) 100%)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'left'
            }}>
              {/* Initials Avatar */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '11px',
                textTransform: 'uppercase',
                flexShrink: 0
              }}>
                {(session.user.user_metadata?.display_name || session.user.email || 'U')[0]}
              </div>
              {/* Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1 }}>
                  Logged In
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                  lineHeight: 1.2
                }} title={session.user.user_metadata?.display_name || session.user.email}>
                  {session.user.user_metadata?.display_name || session.user.email.split('@')[0]}
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setView('landing')} style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            width: '100%',
            justifyContent: 'flex-start',
            borderRadius: '6px',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }} className="btn-back-landing">
            <ArrowLeft size={16} /> Back to Website
          </button>
        </div>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
