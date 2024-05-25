const { BrowserWindow } = require('electron');
const path = require('path');

let entriesWindow = null;

function createEntriesWindow() {
    if (!entriesWindow) {
        entriesWindow = new BrowserWindow({
            width: 1000,
            minWidth: 300,
            height: 500,
            minHeight: 500,
            resizable: false,
            frame: false,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, '/preload.js'),
                contextIsolation: true,
                enableRemoteModule: true,
                nodeIntegration: false,
                sandbox: false,
            }
        });

        if (process.env.ENV === 'prod') {
            entriesWindow.loadURL(`http://localhost:${process.env.ELECTRON_PORT}/entries.html`);
        }
        else {
            entriesWindow.loadURL(`http://localhost:${process.env.ELECTRON_PORT}/entries`);
            entriesWindow.webContents.openDevTools();
        }

        entriesWindow.on('closed', () => { entriesWindow = null; });
    } else {
        entriesWindow.focus();
    }
}

function getEntriesWindow() {
    return entriesWindow;
}

module.exports = {
    createEntriesWindow,
    getEntriesWindow
};