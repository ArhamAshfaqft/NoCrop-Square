import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname, basename, extname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import sharp from 'sharp'
import { autoUpdater } from 'electron-updater'

// Auto-Update Configuration
autoUpdater.autoDownload = false

function setupAutoUpdater() {
  ipcMain.handle('update:check', () => autoUpdater.checkForUpdates())
  ipcMain.handle('update:download', () => autoUpdater.downloadUpdate())
  ipcMain.handle('update:install', () => autoUpdater.quitAndInstall())

  autoUpdater.on('update-available', (info) => {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update:available', info))
  })

  autoUpdater.on('update-downloaded', (info) => {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update:downloaded', info))
  })

  autoUpdater.on('download-progress', (progress) => {
    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update:progress', progress))
  })
  
  // Initial check (optional, or call from frontend)
  // autoUpdater.checkForUpdatesAndNotify() 
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    minWidth: 936,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'ShopSnap',
    ...(process.platform === 'linux' || process.platform === 'win32' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Disable to allow loading local resources
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

  // SINGLE INSTANCE LOCK
  const gotTheLock = app.requestSingleInstanceLock()
  
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      const mainWindow = BrowserWindow.getAllWindows()[0]
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        
        // Handle input from second instance
        // commandLine[0] is typically the executable too
        const argsToSearch = commandLine.slice(1)
        const pathArg = argsToSearch.find(arg => !arg.startsWith('--'))
        if (pathArg && fs.existsSync(pathArg)) {
            console.log("Second Instance Path:", pathArg)
            mainWindow.webContents.send('file:loaded-from-os', pathArg)
        }
      }
    })

    app.whenReady().then(() => {
        electronApp.setAppUserModelId('com.electron')
        
        // Handle input from initial launch
        // In dev, args might be weird, but in prod it's [exe, path]
        let initialPath = null
        if (process.argv.length > 1) {
             // Slice(1) to skip the executable path itself
             const possibleArgs = process.argv.slice(1)
             const pathArg = possibleArgs.find(arg => !arg.startsWith('--'))
             
             if (pathArg && fs.existsSync(pathArg)) {
                 initialPath = pathArg
             }
        }

        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })

        // ... existing IPCS ...
        
        // --- NEW CONTEXT MENU IPC ---
        const { exec } = require('child_process')
        
        ipcMain.handle('system:toggleContextMenu', async (event, enable) => {
            const appPath = app.getPath('exe')
            const iconPath = appPath // Use exe icon
            
            // Commands for Registry
            // HKCU\Software\Classes\Directory\shell\ShopSnap
            // HKCU\Software\Classes\*\shell\ShopSnap (For files)
            
            const regAdd = (key, value, data) => {
                return new Promise((resolve) => {
                    // escape backslashes
                    const safeData = data.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                    const cmd = `reg add "${key}" ${value ? `/v "${value}"` : '/ve'} /d "${safeData}" /f`
                    exec(cmd, (err) => resolve(!err))
                })
            }
            
            const regDel = (key) => {
                return new Promise((resolve) => {
                    exec(`reg delete "${key}" /f`, (err) => resolve(!err))
                })
            }

            if (enable) {
                try {
                    // 1. Folder Background (Directory\Background\shell) - "Process Here" ? No, usually Directory\shell
                    // 2. Folder Item (Directory\shell)
                    await regAdd('HKCU\\Software\\Classes\\Directory\\shell\\ShopSnap', '', 'Send to ShopSnap')
                    await regAdd('HKCU\\Software\\Classes\\Directory\\shell\\ShopSnap', 'Icon', appPath)
                    await regAdd('HKCU\\Software\\Classes\\Directory\\shell\\ShopSnap\\command', '', `"${appPath}" "%1"`)

                    // 3. Single Files (*\shell) - Optional, maybe just folders? User asked for "selects images or folders"
                    // Let's add for files too
                    await regAdd('HKCU\\Software\\Classes\\*\\shell\\ShopSnap', '', 'Send to ShopSnap')
                    await regAdd('HKCU\\Software\\Classes\\*\\shell\\ShopSnap', 'Icon', appPath)
                    await regAdd('HKCU\\Software\\Classes\\*\\shell\\ShopSnap\\command', '', `"${appPath}" "%1"`)
                    
                    return true
                } catch (e) {
                    console.error(e)
                    return false
                }
            } else {
                await regDel('HKCU\\Software\\Classes\\Directory\\shell\\ShopSnap')
                await regDel('HKCU\\Software\\Classes\\*\\shell\\ShopSnap')
                return true
            }
        })

        // ... existing implementations ...
        


  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  ipcMain.handle('dialog:openFiles', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'] }]
    })
    if (canceled) return null
    return filePaths
  })

  ipcMain.handle('file:scanFolder', async (event, inputPaths) => {
    // Ensure input is always an array
    const paths = Array.isArray(inputPaths) ? inputPaths : [inputPaths]
    console.log('Main Process: Scanning paths:', paths)
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.gif', '.heic', '.heif']
    const collectedImages = new Set()

    try {
      for (const currentPath of paths) {
        try {
          const stats = await fs.promises.stat(currentPath)

          // CASE 1: Single File
          if (!stats.isDirectory()) {
             const lower = currentPath.toLowerCase()
             const isImage = imageExtensions.some(ext => lower.endsWith(ext))
             if (isImage) collectedImages.add(currentPath)
          } 
          // CASE 2: Directory
          else {
             console.log('Main Process: Scanning directory:', currentPath)
             const files = await fs.promises.readdir(currentPath)
             
             for (const file of files) {
               const lower = file.toLowerCase()
               if (imageExtensions.some(ext => lower.endsWith(ext))) {
                 collectedImages.add(join(currentPath, file))
               }
             }
          }
        } catch (err) {
          console.error(`Error accessing ${currentPath}:`, err)
        }
      }
      
      const resultArray = Array.from(collectedImages)
      console.log('Main Process: Total images found:', resultArray.length)
      return resultArray

    } catch (error) {
      console.error('Error scanning paths:', error)
      return []
    }
  })

  ipcMain.handle('file:openFolder', async (event, folderPath) => {
    console.log('Main Process: Opening folder:', folderPath)
    await shell.openPath(folderPath)
    return true
  })

  let shouldCancel = false

  ipcMain.handle('image:cancel', () => {
    shouldCancel = true
    return true
  })

  ipcMain.handle('image:process', async (event, { files, settings, isPro }) => {
     let processedCount = 0
     const errors = []
     let finalOutputDir = ''
     shouldCancel = false
     
     // 1. Strict License Check
     if (!isPro) {
        throw new Error("License Required to Process Images. Please activate in Settings.")
     }

     // 2. Disable cache to prevent memory bloat on large batches
     sharp.cache(false)

     for (let i = 0; i < files.length; i++) {
       if (shouldCancel) {
         console.log('Processing Cancelled by User')
         break
       }

       const filePath = files[i]
       try {
         // Notify Renderer of progress
         // Calculate percentage or just count
         const progress = Math.round(((i + 1) / files.length) * 100)
         event.sender.send('process:progress', { 
            current: i + 1, 
            total: files.length, 
            percentage: progress 
         })

         // Initialize Pipeline
         let pipeline = sharp(filePath)
         let operationsPerformed = false

         // Resize
         if (settings.resize?.active) {
            const width = parseInt(settings.resize.width) || null
            const height = parseInt(settings.resize.height) || null
            // Default logic if 'mode' is missing: maintainAspect ? inside : fill
            // New logic: settings.resize.mode can be 'cover', 'contain', 'fill', 'inside'
            let fit = settings.resize.mode || (settings.resize.maintainAspect ? 'inside' : 'fill')
            
            // Map legacy "maintainAspect" checkbox if "mode" isn't explicitly set? 
            // Actually frontend will probably send 'mode'.
            // Valid sharp fits: cover, contain, fill, inside, outside
            
            if (width || height) {
                pipeline = pipeline.resize({ width, height, fit })
                operationsPerformed = true
            }
         }

         // Watermark (Pro logic is now global)
         if (settings.watermark?.active) {
            const wmType = settings.watermark.type || 'text'
            const opacity = settings.watermark.opacity || 0.7
            
            // ... (Image Logic handled in previous block, assumed unchanged here if not targeted) ...
            
            // TYPE: IMAGE (Logo) - Keeping existing logic but grabbing gravity helper
             const getGravity = (pos) => {
                 const p = (pos || '').toLowerCase().trim()
                 if (p === 'bottom-left') return 'southwest'
                 if (p === 'top-right') return 'northeast'
                 if (p === 'top-left') return 'northwest'
                 if (p === 'center') return 'center' 
                 return 'southeast' // default bottom-right
             }

            if (wmType === 'image' && settings.watermark.imagePath && fs.existsSync(settings.watermark.imagePath)) {
                 // ... existing image logic ...
                 try {
                     const bufferForMeta = await pipeline.clone().toBuffer()
                     const metadata = await sharp(bufferForMeta).metadata()
                     const mainWidth = metadata.width
                     const targetLogoWidth = Math.round(mainWidth * 0.20)
                     
                     let logo = sharp(settings.watermark.imagePath).resize({ width: targetLogoWidth }).ensureAlpha()
                     
                     if (opacity < 1.0) {
                         const logoBuffer = await logo.toBuffer()
                         const logoMeta = await sharp(logoBuffer).metadata()
                         const alphaMask = await sharp({
                            create: { width: logoMeta.width, height: logoMeta.height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: opacity } }
                         }).png().toBuffer()
                         logo = sharp(logoBuffer).composite([{ input: alphaMask, blend: 'dest-in' }])
                     }
                     
                     const finalLogoBuffer = await logo.toBuffer()
                     
                     pipeline = pipeline.composite([{ 
                         input: finalLogoBuffer, 
                         gravity: getGravity(settings.watermark.position),
                         blend: 'over' 
                     }])
                     operationsPerformed = true
                 } catch (wmErr) {
                     console.error("Watermark Image Error:", wmErr)
                     errors.push(`Watermark failed for ${basename(filePath)}`)
                 }
            } 
            // TYPE: TEXT
            else if (wmType === 'text' && settings.watermark.text) {
                 const text = settings.watermark.text
                 const bufferForMeta = await pipeline.clone().toBuffer()
                 const metadata = await sharp(bufferForMeta).metadata()
                 const w = metadata.width || 1000
                 const h = metadata.height || 1000
                 const fontSize = Math.floor(w * 0.05)
                 
                 // Smart Text Positioning using SVG coordinates
                 let x = "95%", y = "95%", anchor = "end", baseline = "auto"
                 const pos = (settings.watermark.position || '').toLowerCase().trim()
                 
                 if (pos === 'top-left') { x = "5%"; y = "10%"; anchor = "start"; } // y=10% to account for top ascent
                 else if (pos === 'top-right') { x = "95%"; y = "10%"; anchor = "end"; }
                 else if (pos === 'bottom-left') { x = "5%"; y = "95%"; anchor = "start"; }
                 else if (pos === 'center') { x = "50%"; y = "50%"; anchor = "middle"; baseline = "middle"; }
                 // default bottom-right (95%, 95%, end)

                 const svgText = `
                   <svg width="${w}" height="${h}">
                     <style>
                       .title { fill: rgba(255, 255, 255, ${opacity}); font-size: ${fontSize}px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,${0.5 * opacity}); }
                     </style>
                     <text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}" class="title">${text}</text>
                   </svg>
                 `
                 // For full-size SVG, gravity is strictly 'northwest' (0,0) or center/etc implies alignment of the whole svg. 
                 // Since SVG matches image size, we just overlay it.
                 pipeline = pipeline.composite([{ input: Buffer.from(svgText), blend: 'over' }])
                 operationsPerformed = true
            }
         }

         // Convert / Output Format
         let format = extname(filePath).slice(1).toLowerCase()
         if (format === 'jpeg') format = 'jpg'
         if (format === 'tif') format = 'tiff'
         
         if (settings.convert?.active) {
            format = settings.convert.format || 'jpg'
            operationsPerformed = true
         }
         
         const quality = parseInt(settings.convert?.quality) || 90

         if (format === 'jpg' || format === 'jpeg') pipeline = pipeline.jpeg({ quality })
         else if (format === 'png') pipeline = pipeline.png({ quality })
         else if (format === 'webp') pipeline = pipeline.webp({ quality })
         else if (format === 'avif') {
             pipeline = pipeline.avif({ quality })
         }
         else if (format === 'tiff' || format === 'tif') pipeline = pipeline.tiff({ quality })
         else if (format === 'gif') pipeline = pipeline.gif()

         // Ensure processed folder exists
         let outputDir
         if (settings.outputFolder) {
            outputDir = settings.outputFolder
         } else {
            outputDir = join(dirname(filePath), 'processed')
         }
         
         finalOutputDir = outputDir

         if (!fs.existsSync(outputDir)) {
             await fs.promises.mkdir(outputDir, { recursive: true })
         }

         const suffix = settings.suffix || ''
         
         let outputFilename;

         // Bulk Rename Logic (SEO)
         if (settings.rename?.active && settings.rename?.baseName) {
             const seq = (parseInt(settings.rename.startSeq) || 1) + i
             outputFilename = `${settings.rename.baseName}-${seq}.${format}`
         } else {
             // Default: Original Name + Suffix
             outputFilename = basename(filePath, extname(filePath)) + suffix + '.' + format
         }
         
         await pipeline.toFile(join(outputDir, outputFilename))
         processedCount++

       } catch (err) {
         console.error(`Failed to process ${filePath}:`, err)
         errors.push({ file: filePath, error: err.message })
       }
     }

      return { success: true, processedCount, errors, outputDirectory: finalOutputDir }
  })

  createWindow()

  // If we had an initial path, send it after window is ready
  if (initialPath) {
      setTimeout(() => {
          const win = BrowserWindow.getAllWindows()[0]
          if (win) win.webContents.send('file:loaded-from-os', initialPath)
      }, 1000)
  }

  // Initialize Auto Updater
  setupAutoUpdater()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}) // End whenReady
} // End Single Instance Check

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
