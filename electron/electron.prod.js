const { app, BrowserWindow, ipcMain, session } = require('electron');
require('./ipc');

let store;

const express = require('express');
const path = require('path');
const fs = require('fs');

const logFilePath = path.join(app.getPath('userData'), 'app.log');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const server = express();

server.use(express.static(path.join(__dirname, '../out')));

server.get('/entries', (req, res) => {
    res.sendFile(path.join(__dirname, '../out/entries.html'));
});

server.listen(process.env.ELECTRON_PORT, () => {
    console.log(`Server listening on http://localhost:${process.env.ELECTRON_PORT}`);
});


function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFile(logFilePath, logMessage, err => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

process.on('uncaughtException', (error) => {
    logToFile(`Uncaught Exception: ${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logToFile(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

const createLoggerWindow = require('./screens/loggerWindow');
const setupSettings = require('./setupSettings');

app.whenReady().then(async () => {
    const ses = session.defaultSession;

    // Content-Security-Policy: connect-src 'self' http://localhost:4250;
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
        //store.clear();
    }).catch(err => {
        console.error('Failed to load electron-store:', err);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
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