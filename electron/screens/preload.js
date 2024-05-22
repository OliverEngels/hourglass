const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openEntriesWindow: () => ipcRenderer.send('entries-window'),
    openTagsWindow: () => ipcRenderer.send('tags-window'),
    minimize: () => ipcRenderer.send('minimize'),
    maximize: () => ipcRenderer.send('maximize'),
    closeWindow: () => ipcRenderer.send('close'),
    getStoreValue: (key) => ipcRenderer.invoke('getStoreValue', key),
    setStoreValue: (key, value) => ipcRenderer.invoke('setStoreValue', key, value)
});