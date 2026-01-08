import React, { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
// import { LicenseService } from './services/LicenseService'
import icon from './assets/icon_v2.png'
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
  XCircle
} from 'lucide-react'
import './assets/main.css'

// --- Custom Components ---
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

  const [folderPath, setFolderPath] = useState('')
  const [outputFolder, setOutputFolder] = useState(() => localStorage.getItem('shopsnap_outputFolder') || '')
  const [images, setImages] = useState([])

  // License & Settings
  const [licenseKey, setLicenseKey] = useState(() => localStorage.getItem('shopsnap_licenseKey') || 'FREE-VERSION')
  const [isPro, setIsPro] = useState(true) // ALWAYS TRUE (No Verify)
  const [filenameSuffix, setFilenameSuffix] = useState(() => localStorage.getItem('shopsnap_suffix') || '')

  // Startup License Check REMOVED
  /*
  useEffect(() => {
    // ...
  }, []) 
  */

  // Auto-Update Listeners
  useEffect(() => {
    // Check for updates on mount
    if (window.api.checkForUpdates) {
      window.api.checkForUpdates()

      window.api.onUpdateAvailable((info) => {
        console.log('Update available:', info)
        toast("New Update Available", {
          description: `Version ${info.version} is ready to download.`,
          action: {
            label: "Download",
            onClick: () => {
              toast.promise(window.api.downloadUpdate(), {
                loading: 'Downloading Update...',
                success: 'Downloading in background...',
                error: 'Download Start Failed'
              })
            }
          },
          duration: 10000,
        })
      })

      window.api.onUpdateProgress((progress) => {
        // Optional: You could show a progress bar here if you want
        // For now, simpler is better.
        console.log("Download progress:", progress)
      })

      window.api.onUpdateDownloaded((info) => {
        toast.success("Update Ready to Install", {
          description: "Restart now to apply changes?",
          action: {
            label: "Restart",
            onClick: () => window.api.installUpdate()
          },
          duration: Infinity
        })
      })
    }
  }, [])

  const handleActivateLicense = async () => {
    // Disabled
    toast.success("EtsySnap is fully unlocked! No license needed.")
  }

  // Feature Settings
  // Helper for loading JSON settings
  const loadSettings = (key, defaultVal) => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultVal
  }

  const [resizeSettings, setResizeSettings] = useState(() => loadSettings('shopsnap_resize', { active: true, width: '800', height: '', maintainAspect: true, mode: 'cover' }))
  const [watermarkSettings, setWatermarkSettings] = useState(() => loadSettings('shopsnap_watermark', { active: true, type: 'text', text: 'Confidential', position: 'bottom-right', opacity: 0.7 }))
  const [renameSettings, setRenameSettings] = useState(() => loadSettings('shopsnap_rename', { active: false, baseName: '', startSeq: 1 }))
  const [convertSettings, setConvertSettings] = useState(() => loadSettings('shopsnap_convert', { active: true, format: 'jpg', quality: 90 }))
  const [selectedPresetId, setSelectedPresetId] = useState(null)

  // PERSISTENCE EFFECT
  useEffect(() => {
    localStorage.setItem('shopsnap_outputFolder', outputFolder)
    localStorage.setItem('shopsnap_licenseKey', licenseKey)
    localStorage.setItem('shopsnap_suffix', filenameSuffix)
    localStorage.setItem('shopsnap_resize', JSON.stringify(resizeSettings))
    localStorage.setItem('shopsnap_watermark', JSON.stringify(watermarkSettings))
    localStorage.setItem('shopsnap_rename', JSON.stringify(renameSettings))
    localStorage.setItem('shopsnap_convert', JSON.stringify(convertSettings))
  }, [outputFolder, licenseKey, filenameSuffix, resizeSettings, watermarkSettings, renameSettings, convertSettings])

  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = useState(false)

  // Debounce Refs for Context Menu
  const osFileBuffer = useRef([])
  const osFileTimeout = useRef(null)

  // Presets
  const [presets, setPresets] = useState(() => {
    // REBRANDING: Use new key to force fresh load of Expert Presets
    const saved = localStorage.getItem('shopsnap_presets_v3')
    let initial = []
    if (saved) {
      initial = JSON.parse(saved)
    }

    // IF EMPTY (First run OR keys cleared), Load Defaults
    if (initial.length === 0) {
      return [
        {
          id: 1,
          name: "Etsy Square - Blur Back",
          isDefault: true,
          settings: {
            resize: { width: "2000", height: "2000", maintainAspect: true, mode: 'blur', active: true },
            watermark: { text: "MyShopName", position: "bottom-right", active: false },
            convert: { format: "jpg", quality: 90, active: true },
            rename: { active: true, baseName: 'etsy-listing', startSeq: 1 }
          }
        },
        {
          id: 2,
          name: "Etsy Square - White Back",
          isDefault: true,
          settings: {
            resize: { width: "2000", height: "2000", maintainAspect: true, mode: 'contain', active: true, background: '#ffffff' },
            watermark: { text: "", active: false },
            convert: { format: "jpg", quality: 90, active: true },
            rename: { active: true, baseName: 'etsy-listing', startSeq: 1 }
          }
        },
        {
          id: 3,
          name: "Etsy 4:3 (Landscape)",
          isDefault: true,
          settings: {
            resize: { width: "2700", height: "2025", maintainAspect: true, mode: 'blur', active: true },
            watermark: { active: false },
            convert: { format: "jpg", quality: 90, active: true },
            rename: { active: true, baseName: 'etsy-thumbnail', startSeq: 1 }
          }
        }
      ]
    }

    return initial
  })
  const [newPresetName, setNewPresetName] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 })

  useEffect(() => {
    window.api.onProgress((value) => setProgress(value))

    // Check for OS files (Right click -> Open with ShopSnap)
    window.api.onFileLoadedFromOS((path) => {
      // 1. Add to buffer
      osFileBuffer.current.push(path)

      // 2. Clear existing timeout
      if (osFileTimeout.current) clearTimeout(osFileTimeout.current)

      // 3. Set new timeout (wait for 200ms of silence)
      osFileTimeout.current = setTimeout(async () => {
        const pathsToLoad = [...osFileBuffer.current]
        osFileBuffer.current = [] // Clear buffer immediately

        if (pathsToLoad.length > 0) {
          const scanned = await window.api.scanFolder(pathsToLoad)
          if (scanned && scanned.length > 0) {
            setImages(prev => {
              const unique = scanned.filter(p => !prev.includes(p))
              if (unique.length > 0) {
                // Show ONE toast for the batch
                toast.success(`Loaded ${unique.length} ${unique.length === 1 ? 'image' : 'images'}`, { icon: <CheckCircle2 size={16} /> })
                return [...prev, ...unique]
              }
              return prev
            })
          }
        }
      }, 200)
    })

    return () => window.api.removeProgressListeners()
  }, [])

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Presets Effect
  useEffect(() => {
    localStorage.setItem('shopsnap_presets_v2', JSON.stringify(presets))
  }, [presets])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleSelectFiles = async () => {
    // We prefer files now as per user request, but maybe we can support both?
    // Actually, let's just use openFiles for the main click.
    // If they want a folder, they can drag it, or we add a secondary button?
    // User complaint: "browse from here it only supports folders?? not images ??"
    // So we switch main click to openFiles.

    // We could check if user wants file or folder. 
    // Let's call the new API.
    const files = await window.api.openFiles()
    if (files && files.length > 0) {
      setFolderPath(dirname(files[0])) // Set folder path to the directory of the first file
      setImages(files) // Directly set images!
      toast.success(`${files.length} ${files.length === 1 ? 'image' : 'images'} selected`)
    }
  }

  // NOTE: We keep handleSelectFolder for drag and drop logic if needed, 
  // but the drop handler handles items manually.
  // The main click will now use handleSelectFiles.

  // Helper to extract directory from path since we don't have 'path' module in renderer
  // Actually we get full paths. We can display "Selected Images: N" instead of folder path?
  const dirname = (path) => path.substring(0, path.lastIndexOf('\\') || path.lastIndexOf('/'))

  const handleSelectFolder = async () => {
    // Keep this for potential "Select Folder" button or fallback
    const path = await window.api.openDirectory()
    if (path) {
      setFolderPath(path)
      const scanned = await window.api.scanFolder(path)
      setImages(scanned)
      toast.success(`Loaded ${scanned.length} ${scanned.length === 1 ? 'image' : 'images'}`)
    }
  }

  const loadFolder = async (paths, append = false) => {
    // If it's a single path string (legacy call), wrap in array
    const input = Array.isArray(paths) ? paths : [paths]

    // For display, if multiple, show "Multiple Selection" or first one logic
    // If appending, we probably don't want to change folderPath unless it was empty
    if (!append) {
      if (input.length === 1) setFolderPath(input[0])
      else setFolderPath("Multiple Files / Folders")
    }

    const imgs = await window.api.scanFolder(input)
    if (imgs && imgs.length > 0) {
      if (append) {
        setImages(prev => {
          const unique = imgs.filter(p => !prev.includes(p))
          if (unique.length > 0) {
            toast.success(`Added ${unique.length} new images`)
            return [...prev, ...unique]
          } else {
            toast.info("No new unique images found")
            return prev
          }
        })
      } else {
        setImages(imgs)
        toast.success(`Loaded ${imgs.length} ${imgs.length === 1 ? 'image' : 'images'}`, { icon: <CheckCircle2 size={16} /> })
      }
    } else {
      if (!append) {
        setImages([])
        toast.error("No images found")
      }
    }
  }

  const handleSelectOutputFolder = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      setOutputFolder(path)
      toast.success("Output folder updated")
    }
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
        suffix: filenameSuffix
      }
    }
    setPresets([...presets, newPreset])
    setNewPresetName('')
    toast.success("Preset Saved!")
  }

  const loadPreset = (preset) => {
    setResizeSettings(preset.settings.resize)
    setWatermarkSettings(preset.settings.watermark)
    setConvertSettings(preset.settings.convert)
    if (preset.settings.rename) setRenameSettings(preset.settings.rename) // Add Rename Loading
    setFilenameSuffix(preset.settings.suffix)
    toast.success(`Loaded preset: ${preset.name}`)
  }

  const deletePreset = (id) => {
    setPresets(presets.filter(p => p.id !== id))
    toast.info("Preset deleted")
  }

  const handleProcess = async (type) => {
    // Strict License Check REMOVED
    /*
    if (!isPro) {
      toast.error("Pro License Required", {
        description: "Please activate your license in Settings to process images."
      })
      setCurrentTab('settings')
      return
    }
    */

    if (images.length === 0) {
      toast.error("No images selected", { description: "Please select a folder first." })
      return
    }

    setIsProcessing(true)
    setProgress({ current: 0, total: images.length, percentage: 0 })

    // Construct settings object based on what button was clicked
    // If 'dashboard' (Main Button), ALWAYS activate all enabled tabs logic
    const isDashboard = type === 'dashboard'

    const settings = {
      resize: { ...resizeSettings, active: isDashboard ? resizeSettings.active : type === 'resize' },
      watermark: { ...watermarkSettings, active: isDashboard ? watermarkSettings.active : type === 'watermark' },
      convert: { ...convertSettings, active: isDashboard ? convertSettings.active : type === 'convert' },
      rename: { ...renameSettings, active: type === 'rename' || (isDashboard && renameSettings.active) }, // NEW
      outputFolder: outputFolder || null,
      suffix: filenameSuffix
    }

    try {
      const result = await window.api.processImages({
        files: images,
        settings: settings,
        isPro: isPro
      })

      if (result.success) {
        // Custom UI Toast
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
                Batch Complete!
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Processed {result.processedCount} images successfully.
              </p>
              <button
                style={{
                  marginTop: '10px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  window.api.openFolder(result.outputDirectory)
                  toast.dismiss(t)
                }}
              >
                <FolderOpen size={14} /> Open Folder
              </button>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}
            >
              x
            </button>
          </div>
        ), { duration: 8000 })
      } else {
        toast.error("Something went wrong.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Processing failed", { description: error.message })
    } finally {
      setIsProcessing(false)
      setProgress({ current: 0, total: 0, percentage: 0 })
    }
  }

  // Drag & Drop
  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)

  const onDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const paths = droppedFiles.map(file => window.api.getPathForFile(file)).filter(p => p) // Filter out nulls

      if (paths.length === 0) {
        toast.error("Could not detect file paths.")
      } else {
        toast.info(`Adding ${paths.length} items...`)
        loadFolder(paths, true) // Pass true for append
      }
    }
  }

  // Logo Drag & Drop
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
        toast.error("Please drop an image file (PNG/JPG)")
        return
      }
      const path = window.api.getPathForFile(file)
      setWatermarkSettings({ ...watermarkSettings, imagePath: path })
      toast.success("Logo Selected")
    }
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="card dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Batch NoCrop Square</h2>

              <div className="preset-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Style:</span>
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
                  placeholder="Select Mockup Style..."
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
                  <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Selected: {images.length} {images.length === 1 ? 'Image' : 'Images'}</p>
                ) : (
                  <>
                    <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-main)' }}>Click to select images</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>or drag and drop folder/images here</p>
                  </>
                )}
              </div>
            </div>

            {
              images.length > 0 && (
                <div className="action-bar" style={{ marginTop: '20px', padding: '20px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{images.length} {images.length === 1 ? 'Image' : 'Images'} Ready</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Will apply <b>active settings</b> (Check tabs to customize)
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '12px 20px', fontSize: '14px', borderColor: '#ff4d4d', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => {
                        setImages([])
                        setFolderPath('')
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
              )
            }

            <div className="image-grid" style={{ marginTop: '30px' }}>
              {images.slice(0, 48).map((img, idx) => (
                <div key={idx} className="image-thumbnail" style={{ position: 'relative' }}>
                  <img src={`file:///${img.replace(/\\/g, '/')}`} alt="thumbnail" loading="lazy" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      const newImages = [...images]
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

            <div className="destination-box" style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="section-desc" style={{ fontSize: '13px', margin: 0 }}>
                  Output: {outputFolder ? outputFolder : `[Source]/processed`}
                </p>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleSelectOutputFolder}>Change Location</button>
              </div>
            </div>
          </div >
        )
      case 'resize':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Square Fit (No Crop)</h2>
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
                Leave one dimension empty to auto-scale, or set both to define a maximum bounding box.
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
                  value={resizeSettings.mode || 'blur'}
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
                  <option value="blur">Blur Background (Insta-Ready)</option>
                  <option value="contain">Solid Color (White/Black)</option>
                  <option value="cover">Crop to Fill (Standard)</option>
                  <option value="fill">Internal Use only (Stretch)</option>
                </select>
              </div>
              <button className="btn-primary" onClick={() => handleProcess('resize')} disabled={isProcessing}>
                Start Resize Batch
              </button>

              {/* Dynamic Explanation Block */}
              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-main)', borderRadius: '6px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}>Based on current settings:</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {(!resizeSettings.width && !resizeSettings.height) ? (
                    "No dimensions set. Images will not be resized."
                  ) : (
                    <>
                      Images will be resized to
                      {resizeSettings.width && !resizeSettings.height && <span> <b>width {resizeSettings.width}px</b> (height auto).</span>}
                      {!resizeSettings.width && resizeSettings.height && <span> <b>height {resizeSettings.height}px</b> (width auto).</span>}
                      {resizeSettings.width && resizeSettings.height && (
                        <span> <b>{resizeSettings.width}x{resizeSettings.height}px</b>.
                          {(!resizeSettings.mode || resizeSettings.mode === 'inside') && " Aspect ratio preserved (may be smaller)."}
                          {resizeSettings.mode === 'cover' && " Excess edges cropped to fill exactly."}
                          {resizeSettings.mode === 'fill' && " Stretched to fit explicitly."}
                          {resizeSettings.mode === 'contain' && " Padded with transparency to fit."}
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      case 'watermark':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Watermark (Protection)</h2>
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
                  <span style={{ fontWeight: 500 }}>Text Design</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="wmType"
                    checked={watermarkSettings.type === 'image'}
                    onChange={() => {
                      setWatermarkSettings({ ...watermarkSettings, type: 'image' })
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>Image Design</span>
                </label>
              </div>

              {watermarkSettings.type === 'text' ? (
                <div className="form-group">
                  <label>Design Text</label>
                  <input type="text" value={watermarkSettings.text} onChange={e => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload Design (PNG/JPG)</label>
                  <div
                    style={{
                      background: isDraggingLogo ? 'rgba(134, 77, 226, 0.1)' : 'var(--input-bg)',
                      padding: '15px',
                      borderRadius: '8px',
                      border: isDraggingLogo ? '2px dashed var(--primary)' : '1px dashed var(--input-border)',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onDragOver={onLogoDragOver}
                    onDragLeave={onLogoDragLeave}
                    onDrop={onLogoDrop}
                  >
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={async () => {
                        const file = await window.api.openFiles()
                        if (file && file.length > 0) {
                          setWatermarkSettings({ ...watermarkSettings, imagePath: file[0] })
                        }
                      }}
                    >
                      <UploadCloud size={16} /> Choose Design File
                    </button>
                    {watermarkSettings.imagePath ? (
                      <p style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
                        Selected: <b>{watermarkSettings.imagePath}</b>
                      </p>
                    ) : (
                      <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {isDraggingLogo ? "Drop it!" : "or Drag & Drop here"}
                      </p>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    Design will be auto-resized to fit the mockups.
                  </p>
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
                  <option value="bottom-right">Bottom Right Corner</option>
                  <option value="center">Center</option>
                  <option value="top-left">Top Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nudge X (px)</label>
                    <input type="number" placeholder="0" value={watermarkSettings.offsetX || 0} onChange={(e) => setWatermarkSettings({ ...watermarkSettings, offsetX: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nudge Y (px)</label>
                    <input type="number" placeholder="0" value={watermarkSettings.offsetY || 0} onChange={(e) => setWatermarkSettings({ ...watermarkSettings, offsetY: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                  Use Nudge to fine-tune placement (Positive X = Right, Positive Y = Down).
                </p>
              </div>
              <br />
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
              <h2>SEO Renamer</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={renameSettings.active}
                  onChange={e => {
                    setRenameSettings({ ...renameSettings, active: e.target.checked })
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div style={{ opacity: renameSettings.active ? 1 : 0.4, pointerEvents: renameSettings.active ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Rename your files for Etsy Search (e.g., "handmade-ceramic-mug.jpg").
              </p>

              <div className="form-group">
                <label>Base Filename (Keywords)</label>
                <input
                  type="text"
                  placeholder="e.g. vintage-leather-bag"
                  value={renameSettings.baseName}
                  onChange={e => setRenameSettings({ ...renameSettings, baseName: e.target.value })}
                  disabled={!renameSettings.active}
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Start Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  value={renameSettings.startSeq}
                  onChange={e => setRenameSettings({ ...renameSettings, startSeq: parseInt(e.target.value) })}
                  disabled={!renameSettings.active}
                />
              </div>

              <div style={{ marginTop: '20px', padding: '10px', background: 'var(--input-bg)', borderRadius: '6px', fontSize: '12px' }}>
                Preview: <b>{renameSettings.baseName || 'original'}-{renameSettings.startSeq}.jpg</b>
              </div>

              <br />
              <button className="btn-primary" onClick={() => handleProcess('rename')} disabled={isProcessing || !renameSettings.active}>
                Start Etsy Rename
              </button>
            </div>
          </div>
        )
      case 'convert':
        return (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>File Type (Convert)</h2>
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
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                  <option value="avif">AVIF</option>
                  <option value="tiff">TIFF</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quality ({convertSettings.quality}%)</label>
                <input type="range" min="1" max="100" value={convertSettings.quality} onChange={e => setConvertSettings({ ...convertSettings, quality: e.target.value })} />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                onClick={() => handleProcess('convert')}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                Start Conversion Batch
              </button>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="card">
            <h2>Settings</h2>

            <div className="section">
              <h3>Appearance</h3>
              <button className="btn-secondary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </button>
            </div>

            {/* License Section REMOVED for Etsy Version */}
            {/* 
            <div className="section mt-4">
              <h3>License</h3>
              ...
            </div> 
            */}



            <div className="section mt-4">
              <h3>Windows Integration</h3>
              <p className="helper-text">Add "Send to OptiSnap" to your right-click menu in File Explorer.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn-secondary" onClick={async () => {
                  const success = await window.api.toggleContextMenu(true)
                  if (success) toast.success("Added to Context Menu!")
                  else toast.error("Failed to update Registry")
                }}>
                  Enable Right-Click Menu
                </button>
                <button className="btn-secondary" style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }} onClick={async () => {
                  const success = await window.api.toggleContextMenu(false)
                  if (success) toast.info("Removed from Context Menu")
                }}>
                  Remove
                </button>
              </div>
            </div>

            <div className="section mt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3>Saved Presets</h3>
              <p className="helper-text" style={{ marginBottom: '15px' }}>Save your current configuration (Resize, Watermark, Convert settings) as a preset.</p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Preset Name (e.g. Instagram)"
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                />
                <button className="btn-primary" onClick={savePreset}><Save size={16} /> Save Current</button>
              </div>

              <div className="presets-list">
                {presets.filter(p => !p.isDefault).length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No custom presets.</p>}
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

            <div className="section mt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3>Help & Support</h3>
              <p className="helper-text">Need help with the app?</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  window.open('mailto:support@nocropsquare.com?subject=NoCrop Square Support Request')
                }}
                style={{ marginTop: '10px' }}
              >
                <HelpCircle size={14} style={{ marginRight: '6px' }} /> Contact Support
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <p>NoCrop Square v1.0.0</p>
              <p>© 2025 NoCrop Square</p>
            </div>

          </div>
        )
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="app-container">
      <Toaster position="top-center" richColors theme={theme} />

      {isProcessing && (
        <div className="progress-overlay">
          <div className="spinner-box">
            <Loader2 className="animate-spin" size={40} color="#864DE2" />
            <p>Processing Images...</p>
            {progress.total > 0 && (
              <div style={{ marginTop: '10px', width: '100%' }}>
                <p style={{ marginBottom: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {progress.current} of {progress.total}
                </p>
                <div style={{ width: '200px', height: '6px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress.percentage}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }}></div>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                window.api.cancelProcessing()
                toast.error("Cancelling...")
              }}
              className="btn-secondary"
              style={{ marginTop: '15px', color: '#ff4d4d', borderColor: '#ff4d4d' }}
            >
              <XCircle size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0px', fontSize: '22px', fontWeight: 'bold', fontFamily: 'Merriweather, serif' }}>
          <img src={icon} alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
          NoCrop Square
        </div>
        <nav>
          <button className={currentTab === 'dashboard' ? 'active' : ''} onClick={() => setCurrentTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={currentTab === 'resize' ? 'active' : ''} onClick={() => setCurrentTab('resize')}>
            <Scaling size={18} /> Square Fit
          </button>
          <button className={`nav-item ${currentTab === 'watermark' ? 'active' : ''}`} onClick={() => setCurrentTab('watermark')}>
            <Stamp size={18} /> Watermark
          </button>
          <button className={`nav-item ${currentTab === 'rename' ? 'active' : ''}`} onClick={() => setCurrentTab('rename')}>
            <FilePenLine size={18} /> SEO Renamer
          </button>
          <button className={`nav-item ${currentTab === 'convert' ? 'active' : ''}`} onClick={() => setCurrentTab('convert')}>
            <FileType size={18} /> File Type
          </button>
          <div className="divider"></div>
          <button className={currentTab === 'settings' ? 'active' : ''} onClick={() => setCurrentTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div >
  )
}

export default App
