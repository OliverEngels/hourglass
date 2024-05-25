const { BrowserWindow } = require('electron');
const path = require('path');

let loggerWindow = null;

function createLoggerWindow() {
    if (!loggerWindow) {
        const preloadPath = path.join(__dirname, 'preload.js');
        loggerWindow = new BrowserWindow({
            width: 300,
            minWidth: 300,
            maxWidth: 300,
            height: 500,
            minHeight: 400,
            maxHeight: 500,
            resizable: true,
            frame: false,
            icon: process.platform === 'darwin' ? path.join(__dirname, '..', 'public', 'icon', 'icon.icns') :
                process.platform === 'win32' ? path.join(__dirname, '..', 'public', 'icon', 'icon.ico') :
                    path.join(__dirname, '..', 'public', 'icon', 'icon.png'),
            webPreferences: {
                preload: preloadPath,
                contextIsolation: true,
                enableRemoteModule: true,
                nodeIntegration: false,
                sandbox: false
            }
        });

        loggerWindow.loadURL(`http://localhost:${process.env.ELECTRON_PORT}`);
        if (process.env.ENV === 'dev') {
            loggerWindow.webContents.openDevTools();
        }

        loggerWindow.on('closed', () => loggerWindow = null);
    } else {
        loggerWindow.focus();
    }
}

function getLoggerWindow() {
    return loggerWindow;
}

module.exports = {
    getLoggerWindow,
    createLoggerWindow
};