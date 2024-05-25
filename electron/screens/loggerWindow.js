const { BrowserWindow, screen } = require('electron');
const path = require('path');

let loggerWindow = null;

const { getTagWindow } = require('./tagsWindow');
const { getEntriesWindow } = require('./entriesWindow');

function createLoggerWindow(from) {
    let tags = null;
    let entries = null;

    if (getTagWindow)
        tags = getTagWindow();
    if (getEntriesWindow)
        entries = getEntriesWindow();

    const primaryDisplay = screen.getPrimaryDisplay();
    const { workAreaSize } = primaryDisplay;

    const newWindowWidth = 300;
    const newWindowHeight = 500;

    let newX = workAreaSize.width - newWindowWidth;
    let newY = workAreaSize.height - newWindowHeight;

    if (tags != null && from == 'tags') {
        const [mainX, mainY] = tags.getPosition();
        const [mainWidth, mainHeight] = tags.getSize();

        newX = tags ? mainX + mainWidth + 10 : 0;
        newY = tags ? mainY : 0;
    }

    if (entries != null && from == 'entries') {
        const [mainX, mainY] = entries.getPosition();
        const [mainWidth, mainHeight] = entries.getSize();

        newX = entries ? mainX + mainWidth + 10 : 0;
        newY = entries ? mainY : 0;
    }

    if (!loggerWindow) {
        const preloadPath = path.join(__dirname, 'preload.js');
        loggerWindow = new BrowserWindow({
            width: newWindowWidth,
            minWidth: 300,
            maxWidth: 300,
            height: newWindowHeight,
            minHeight: 400,
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