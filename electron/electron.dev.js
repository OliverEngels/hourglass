const { app, BrowserWindow, ipcMain, session } = require('electron');

require('dotenv').config();

let store;

require('./ipc');

const { createLoggerWindow } = require('./screens/loggerWindow');
const setupSettings = require('./setupSettings');

const dev = process.env.ENV === 'dev';

const next = require('next');
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/../node_modules/electron`)
});

nextApp.prepare().then(async () => {
    const ses = session.defaultSession;

    ses.webRequest.onHeadersReceived((details, callback) => {
        const newCsp = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' http://localhost:${process.env.NEXT_PUBLIC_MONGO_API_PORT}; style-src 'self' 'unsafe-eval' 'unsafe-inline'`;
        const responseHeaders = Object.assign({}, details.responseHeaders, {
            "Content-Security-Policy": [newCsp],
            "Access-Control-Allow-Origin": `http://localhost:${process.env.ELECTRON_PORT}`
        });

        callback({ cancel: false, responseHeaders });
    });

    app.whenReady().then(() => {
        createLoggerWindow();
        setupSettings();
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

    require('http').createServer((req, res) => {
        handle(req, res);
    }).listen(process.env.ELECTRON_PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${process.env.ELECTRON_PORT}`);
    });

    await import('electron-store').then((StoreModule) => {
        store = new StoreModule.default();
        //store.clear();
    }).catch(err => {
        console.error('Failed to load electron-store:', err);
    });
}).catch(ex => {
    console.error('Error during Next.js preparation:', ex.stack);
});



// Handle storing of data
ipcMain.handle('getStoreValue', (event, key) => {
    return store.get(key);
});

ipcMain.handle('setStoreValue', (event, key, value) => {
    store.set(key, value);
});