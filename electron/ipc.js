const { BrowserWindow, ipcMain } = require('electron');

const { getEntriesWindow, createEntriesWindow } = require('./screens/entriesWindow');
const { getLoggerWindow } = require('./screens/loggerWindow');
const { getTagWindow, createTagWindow } = require('./screens/tagsWindow');

// handle window summoning
ipcMain.on('entries-window', (event, arg) => {
    createEntriesWindow();
});

ipcMain.on('tags-window', (event, arg) => {
    createTagWindow();
});

// Handle window controls
ipcMain.on('minimize', (event) => {
    let focusedWindow = BrowserWindow.getFocusedWindow();

    if (focusedWindow) {
        focusedWindow.minimize();
    }
});

ipcMain.on('maximize', (event) => {
    let focusedWindow = BrowserWindow.getFocusedWindow();

    if (focusedWindow) {
        if (focusedWindow.isMaximized()) {
            focusedWindow.unmaximize();
        } else {
            focusedWindow.maximize();
        }
    }
});

ipcMain.on('close', (event) => {
    let focusedWindow = BrowserWindow.getFocusedWindow();

    if (focusedWindow) {
        focusedWindow.close();
    }
});

// Handle cross window updates

let entriesWindow = null;
let loggerWindow = null;
let tagWindow = null;
ipcMain.on('update-data', (event, data) => {
    tagWindow = getTagWindow();
    entriesWindow = getEntriesWindow();
    loggerWindow = getLoggerWindow();

    if (entriesWindow != null)
        entriesWindow.webContents.send('data-updated', data);
    if (loggerWindow != null)
        loggerWindow.webContents.send('data-updated', data);
    if (tagWindow != null)
        tagWindow.webContents.send('data-updated', data);
});