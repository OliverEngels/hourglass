const { BrowserWindow } = require('electron');
const path = require('path')

let tagWindow = null;

module.exports = function createTagsWindow() {
    if (!tagWindow) {
        tagWindow = new BrowserWindow({
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

        tagWindow.loadURL('../out/tags.html');

        tagWindow.on('closed', () => {
            tagWindow = null;
        });
    } else {
        tagWindow.focus();
    }
}