const { BrowserWindow } = require('electron');
const path = require('path');

let entriesWindow = null;

const { getTagWindow } = require('./tagsWindow');
const { getLoggerWindow } = require('./loggerWindow');

function createEntriesWindow(from) {
    let tags = null;
    let logger = null;

    if (getTagWindow)
        tags = getTagWindow();
    if (getLoggerWindow)
        logger = getLoggerWindow();

    let newX = 5;
    let newY = 5;

    if (tags != null && from == 'tags') {
        const [mainX, mainY] = tags.getPosition();
        const [mainWidth, mainHeight] = tags.getSize();

        newX = tags ? mainX + mainWidth + 10 : 0;
        newY = tags ? mainY : 0;
    }

    if (logger != null && from == 'logger') {
        const [mainX, mainY] = logger.getPosition();
        const [mainWidth, mainHeight] = logger.getSize();

        newX = logger ? mainX - 1000 - 10 : 0;
        newY = logger ? mainY : 0;
    }

    if (!entriesWindow) {
        entriesWindow = new BrowserWindow({
            width: 1000,
            minWidth: 300,
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