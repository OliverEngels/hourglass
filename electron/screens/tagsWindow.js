const { BrowserWindow } = require('electron');
const path = require('path');

const { getLoggerWindow } = require('./loggerWindow');

let tagWindow = null;

function createTagWindow() {
    let logger = null;

    if (getTagWindow)
        logger = getLoggerWindow();

    let newX = 5;
    let newY = 5;
    let newHeight = 500;

    if (logger != null) {
        const [mainX, mainY] = logger.getPosition();
        const [mainWidth, mainHeight] = logger.getSize();

        newX = logger ? mainX + mainWidth + 10 : 0;
        newY = logger ? mainY : 0;
        newHeight = mainHeight;
    }

    if (!tagWindow) {
        tagWindow = new BrowserWindow({
            width: 400,
            minWidth: 300,
            maxWidth: 700,
            height: newHeight,
            minHeight: 425,
            x: newX,
            y: newY,
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

        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
            tagWindow.loadURL(`http://localhost:${process.env.ELECTRON_PORT}/tags.html`);
        }
        else {
            tagWindow.loadURL(`http://localhost:${process.env.ELECTRON_PORT}/tags`);
            // tagWindow.webContents.openDevTools();
        }

        tagWindow.on('closed', () => { tagWindow = null; });
    } else {
        tagWindow.focus();
    }
}

function getTagWindow() {
    return tagWindow;
}

module.exports = {
    createTagWindow,
    getTagWindow
};