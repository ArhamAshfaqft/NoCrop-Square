import { removeBackground } from '@imgly/background-removal'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'

// Helper to load a file/blob as an HTMLImageElement
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
  })
}

// Convert canvas to blob with support for standard formats
const canvasToBlob = (canvas, format, quality) => {
  return new Promise((resolve) => {
    let mimeType = 'image/jpeg'
    if (format === 'png') mimeType = 'image/png'
    if (format === 'webp') mimeType = 'image/webp'
    if (format === 'avif') mimeType = 'image/avif'

    canvas.toBlob((blob) => {
      // If the browser doesn't support the requested format (e.g. avif in older engines), 
      // it returns null or falls back. We check if blob is returned.
      if (blob) {
        resolve(blob)
      } else {
        // Fallback to jpeg
        canvas.toBlob((fallbackBlob) => resolve(fallbackBlob), 'image/jpeg', quality)
      }
    }, mimeType, quality)
  })
}

export const ImageProcessorService = {
  /**
   * Process a single image file client-side
   */
  async processSingleImage(file, settings, onProgress) {
    let currentBlob = file
    const originalName = file.name || 'image.jpg'

    // 1. Background Removal (if enabled)
    if (settings.backgroundRemoval?.active) {
      if (onProgress) onProgress("Removing background...")
      try {
        currentBlob = await removeBackground(currentBlob)
      } catch (err) {
        console.error("Background removal error, skipping background removal:", err)
      }
    }

    // Load image into HTML Image object for canvas operations
    const objectUrl = URL.createObjectURL(currentBlob)
    let img
    try {
      img = await loadImage(objectUrl)
    } finally {
      URL.revokeObjectURL(objectUrl)
    }

    // 2. Setup Canvas & Dimensions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const originalWidth = img.width
    const originalHeight = img.height

    let targetWidth = originalWidth
    let targetHeight = originalHeight

    // Calculate dimensions based on settings
    if (settings.resize?.active) {
      const resizeWidth = parseInt(settings.resize.width) || null
      const resizeHeight = parseInt(settings.resize.height) || null
      const mode = settings.resize.mode || 'inside' // 'inside', 'cover', 'contain', 'fill'

      if (resizeWidth || resizeHeight) {
        if (mode === 'inside') {
          // Scale to fit inside width/height maintaining aspect ratio (No padding)
          const ratio = Math.min(
            resizeWidth ? resizeWidth / originalWidth : 1,
            resizeHeight ? resizeHeight / originalHeight : 1
          )
          targetWidth = Math.round(originalWidth * ratio)
          targetHeight = Math.round(originalHeight * ratio)
        } else if (mode === 'fill') {
          // Stretch to fill
          targetWidth = resizeWidth || originalWidth
          targetHeight = resizeHeight || originalHeight
        } else if (mode === 'cover' || mode === 'contain') {
          targetWidth = resizeWidth || originalWidth
          targetHeight = resizeHeight || originalHeight
        }
      }
    }

    canvas.width = targetWidth
    canvas.height = targetHeight

    // Get output format (to decide if we should initialize with white background)
    const format = settings.convert?.active ? (settings.convert.format || 'jpg') : 'jpg'

    // If format is JPEG (jpg), initialize the canvas with a solid white background
    // to avoid transparent areas rendering as black
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }

    // Fill background / Draw Image
    if (settings.resize?.active && (settings.resize.mode === 'cover' || settings.resize.mode === 'contain')) {
      const mode = settings.resize.mode
      const bgMode = settings.resize.bgMode || 'solid' // 'solid', 'blur'
      const bgColor = settings.resize.bgColor || '#ffffff'

      const scale = mode === 'cover'
        ? Math.max(targetWidth / originalWidth, targetHeight / originalHeight)
        : Math.min(targetWidth / originalWidth, targetHeight / originalHeight)

      const drawWidth = originalWidth * scale
      const drawHeight = originalHeight * scale
      const x = (targetWidth - drawWidth) / 2
      const y = (targetHeight - drawHeight) / 2

      if (mode === 'contain') {
        if (bgMode === 'blur') {
          // Draw blurred background
          ctx.save()
          // Stretch original image to fill canvas as blurred background
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          ctx.filter = 'blur(20px) brightness(80%)'
          ctx.drawImage(canvas, 0, 0)
          ctx.restore()
        } else {
          // Solid color background
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, targetWidth, targetHeight)
        }
      }

      ctx.drawImage(img, x, y, drawWidth, drawHeight)
    } else {
      // Normal draw (inside, fill, or un-resized)
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    }

    // 3. Watermarking
    if (settings.watermark?.active) {
      const wmType = settings.watermark.type || 'text'
      const opacity = settings.watermark.opacity || 0.7
      const position = (settings.watermark.position || 'bottom-right').toLowerCase().trim()

      ctx.save()
      ctx.globalAlpha = opacity

      // Helper to calculate X/Y coordinates based on position
      const getCoords = (pos, itemWidth, itemHeight, paddingX = 20, paddingY = 20) => {
        let x = targetWidth - itemWidth - paddingX
        let y = targetHeight - itemHeight - paddingY

        if (pos === 'top-left') {
          x = paddingX
          y = paddingY
        } else if (pos === 'top-right') {
          x = targetWidth - itemWidth - paddingX
          y = paddingY
        } else if (pos === 'bottom-left') {
          x = paddingX
          y = targetHeight - itemHeight - paddingY
        } else if (pos === 'center') {
          x = (targetWidth - itemWidth) / 2
          y = (targetHeight - itemHeight) / 2
        }

        return { x, y }
      }

      if (wmType === 'text' && settings.watermark.text) {
        const text = settings.watermark.text
        const fontSize = Math.floor(targetWidth * 0.04) || 24

        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.fillStyle = '#ffffff'
        
        // Shadow effect for text readability (matches SVG text-shadow)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3

        const textMetrics = ctx.measureText(text)
        const textWidth = textMetrics.width
        const textHeight = fontSize // Approx height

        // Account for canvas baseline aligning at bottom
        let { x, y } = getCoords(position, textWidth, textHeight)
        y += textHeight // align text ascent

        ctx.fillText(text, x, y)
      } else if (wmType === 'image' && settings.watermark.logoFile) {
        // logoFile is a File object uploaded client-side
        const logoUrl = URL.createObjectURL(settings.watermark.logoFile)
        try {
          const logoImg = await loadImage(logoUrl)
          
          // Logo size is roughly 20% of main image width
          const targetLogoWidth = Math.round(targetWidth * 0.20)
          const targetLogoHeight = (logoImg.height / logoImg.width) * targetLogoWidth

          const { x, y } = getCoords(position, targetLogoWidth, targetLogoHeight)
          ctx.drawImage(logoImg, x, y, targetLogoWidth, targetLogoHeight)
        } catch (err) {
          console.error("Failed to load watermark logo:", err)
        } finally {
          URL.revokeObjectURL(logoUrl)
        }
      }

      ctx.restore()
    }

    // 4. Output format & Quality Export
    const quality = (parseInt(settings.convert?.quality) || 90) / 100
    
    let processedBlob = await canvasToBlob(canvas, format, quality)

    // 5. Lossless Browser Compression (if enabled)
    if (settings.compress?.active) {
      if (onProgress) onProgress("Optimizing compression...")
      try {
        const compressionFile = new File([processedBlob], originalName, { type: processedBlob.type })
        const compressedFile = await imageCompression(compressionFile, {
          maxSizeMB: settings.compress.maxSizeMB || 1,
          maxWidthOrHeight: Math.max(targetWidth, targetHeight),
          useWebWorker: true
        })
        processedBlob = compressedFile
      } catch (err) {
        console.error("Compression failed, using uncompressed output:", err)
      }
    }

    return processedBlob
  },

  /**
   * Process a batch of images and generate a downloadable ZIP archive
   */
  async processBatch(files, settings, onProgress) {
    const zip = new JSZip()
    const errors = []
    let processedCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            percentage: Math.round(((i + 1) / files.length) * 100),
            statusText: `Processing image ${i + 1} of ${files.length}...`
          })
        }

        const processedBlob = await this.processSingleImage(file, settings, (statusText) => {
          if (onProgress) {
            onProgress({
              current: i + 1,
              total: files.length,
              percentage: Math.round((i / files.length) * 100),
              statusText: `[Image ${i + 1}/${files.length}] ${statusText}`
            })
          }
        })

        // Naming Logic
        let outputFilename
        const format = settings.convert?.active ? (settings.convert.format || 'jpg') : 'jpg'
        
        if (settings.rename?.active && settings.rename?.baseName) {
          const seq = (parseInt(settings.rename.startSeq) || 1) + i
          outputFilename = `${settings.rename.baseName}-${seq}.${format}`
        } else {
          // Original Name + Suffix
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || 'image'
          const suffix = settings.suffix || ''
          outputFilename = `${nameWithoutExt}${suffix}.${format}`
        }

        zip.file(outputFilename, processedBlob)
        processedCount++
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err)
        errors.push({ file: file.name, error: err.message })
      }
    }

    if (processedCount === 0) {
      throw new Error(errors[0]?.error || "No images were successfully processed.")
    }

    if (onProgress) {
      onProgress({
        current: files.length,
        total: files.length,
        percentage: 100,
        statusText: "Packaging ZIP archive..."
      })
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    return { zipBlob, processedCount, errors }
  }
}
