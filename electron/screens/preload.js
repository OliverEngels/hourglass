const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openEntriesWindow: (from) => ipcRenderer.send('entries-window', from),
    openTagsWindow: (from) => ipcRenderer.send('tags-window', from),
    openLoggerWindow: (from) => ipcRenderer.send('logger-window', from),
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