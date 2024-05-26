const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openEntriesWindow: () => ipcRenderer.send('entries-window'),
    openTagsWindow: () => ipcRenderer.send('tags-window'),
    openLoggerWindow: () => ipcRenderer.invoke('logger-window'),
    minimize: () => ipcRenderer.send('minimize'),
    maximize: () => ipcRenderer.send('maximize'),
    closeWindow: () => ipcRenderer.send('close'),
    getStoreValue: (key) => ipcRenderer.invoke('getStoreValue', key),
    setStoreValue: (key, value) => ipcRenderer.invoke('setStoreValue', key, value),
    sendUpdate: (data) => ipcRenderer.send('update-data', data),
    onDataUpdate: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('data-updated', listener);

        const cleanupListener = () => {
            ipcRenderer.removeListener('data-updated', listener);
        };

        return cleanupListener;
    },
});