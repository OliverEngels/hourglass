const { BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let loggerWindow = null;

function createLoggerWindow() {
    return new Promise((resolve, reject) => {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { workAreaSize } = primaryDisplay;

        const newWindowWidth = 300;
        const newWindowHeight = 500;

        let newX = workAreaSize.width - newWindowWidth;
        let newY = workAreaSize.height - newWindowHeight;

        if (!loggerWindow) {
            const preloadPath = path.join(__dirname, 'preload.js');
            loggerWindow = new BrowserWindow({
                width: newWindowWidth,
                minWidth: 300,
                maxWidth: 300,
                height: newWindowHeight,
                minHeight: 425,
                maxHeight: 500,
                x: newX,
                y: newY,
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
            if (process.env.NEXT_PUBLIC_ENV === 'dev') {
                loggerWindow.webContents.openDevTools();
            }

            loggerWindow.on('closed', () => loggerWindow = null);

            loggerWindow.on('ready-to-show', (event, arg) => {
                setTimeout(() => {
                    resolve('Logger window created successfully');
                }, 1000);
            });
        } else {
            loggerWindow.focus();
            resolve('Logger window created successfully');
        }
    });
}

function getLoggerWindow() {
    return loggerWindow;
}

module.exports = {
    getLoggerWindow,
    createLoggerWindow
};