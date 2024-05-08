const { BrowserWindow, ipcMain } = require('electron');

const createEntriesWindow = require('./screens/entriesWindow');
const createTagsWindow = require('./screens/tagsWindow');

ipcMain.on('entries-window', (event, arg) => {
    createEntriesWindow();
});

ipcMain.on('tags-window', (event, arg) => {
    createTagsWindow();
});

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