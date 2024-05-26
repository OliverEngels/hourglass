const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

const logFilePath = path.join(app.getPath('userData'), 'app.log');
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, err => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

logToFile('Application starting...');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('./ipc');

let store;

const express = require('express');
const server = express();

server.use(express.static(path.join(__dirname, '../out')));

server.get('/entries', (req, res) => {
    res.sendFile(path.join(__dirname, '../out/entries.html'));
});

server.listen(process.env.ELECTRON_PORT, () => {
    logToFile(`Server listening on http://localhost:${process.env.ELECTRON_PORT}`);
});

process.on('uncaughtException', (error) => {
    logToFile(`Uncaught Exception: ${error.stack}`);
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logToFile(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const { createLoggerWindow } = require('./screens/loggerWindow');
const setupSettings = require('./setupSettings');

app.on('ready', () => {
    logToFile('App is ready.');
});

app.whenReady().then(async () => {
    logToFile('Inside app.whenReady');
    try {
        const ses = session.defaultSession;

        ses.webRequest.onHeadersReceived((details, callback) => {
            const newCsp = `default-src 'self'; connect-src 'self' http://localhost:${process.env.NEXT_PUBLIC_MONGO_API_PORT}`;
            const responseHeaders = Object.assign({}, details.responseHeaders, {
                "Content-Security-Policy": [newCsp],
                "Access-Control-Allow-Origin": `http://localhost:${process.env.ELECTRON_PORT}`
            });

            callback({ cancel: false, responseHeaders });
        });

        createLoggerWindow();
        setupSettings();

        await import('electron-store').then((StoreModule) => {
            store = new StoreModule.default();
        }).catch(err => {
            console.error('Failed to load electron-store:', err);
            logToFile(`Failed to load electron-store: ${err.message}`);
        });

        logToFile('Finished setting up store.');
    } catch (error) {
        console.error('Error in app.whenReady:', error);
        logToFile(`Error in app.whenReady: ${error.message}`);
    }
});

app.on('window-all-closed', () => {
    logToFile('All windows closed.');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    logToFile('App activate event.');
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoggerWindow();
    }
});

ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
});

ipcMain.handle('setStoreValue', (event, key, value) => {
    store.set(key, value);
});