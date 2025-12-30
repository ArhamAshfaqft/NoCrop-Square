import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  scanFolder: (path) => ipcRenderer.invoke('file:scanFolder', path),
  saveLicense: (key) => {
    console.log('License saved:', key)
    return true
  },
  processImages: (args) => ipcRenderer.invoke('image:process', args),
  cancelProcessing: () => ipcRenderer.invoke('image:cancel'),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  onProgress: (callback) => ipcRenderer.on('process:progress', (event, value) => callback(value)),
  removeProgressListeners: () => ipcRenderer.removeAllListeners('process:progress'),
  openFolder: (path) => ipcRenderer.invoke('file:openFolder', path),
  toggleContextMenu: (enable) => ipcRenderer.invoke('system:toggleContextMenu', enable),
  onFileLoadedFromOS: (callback) => ipcRenderer.on('file:loaded-from-os', (event, path) => callback(path)),
  // Update API
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update:available', (_, Info) => callback(Info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update:downloaded', (_, Info) => callback(Info)),
  onUpdateProgress: (callback) => ipcRenderer.on('update:progress', (_, progress) => callback(progress))
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
