const { BrowserWindow } = require('electron');
const path = require('path');

const { getLoggerWindow } = require('./loggerWindow');
const { getEntriesWindow } = require('./entriesWindow');

let tagWindow = null;

function createTagWindow(from = "") {
    let entries = null;
    let logger = null;

    if (getEntriesWindow)
        entries = getEntriesWindow();
    if (getTagWindow)
        logger = getLoggerWindow();

    let newX = 5;
    let newY = 5;

    if (logger != null && from == 'logger') {
        const [mainX, mainY] = logger.getPosition();
        const [mainWidth, mainHeight] = logger.getSize();

        newX = logger ? mainX + mainWidth + 10 : 0;
        newY = logger ? mainY : 0;
    }
    if (entries != null && from == 'entries') {
        const [mainX, mainY] = entries.getPosition();
        const [mainWidth, mainHeight] = entries.getSize();

        newX = entries ? mainX + mainWidth + 10 : 0;
        newY = entries ? mainY : 0;
    }

    if (!tagWindow) {
        tagWindow = new BrowserWindow({
            width: 500,
            minWidth: 300,
            maxWidth: 700,
            height: 500,
            minHeight: 500,
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

        if (process.env.ENV === 'prod') {
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