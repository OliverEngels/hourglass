const { app, BrowserWindow, ipcMain, session } = require('electron');
require('./ipc');
require('dotenv').config();

const createLoggerWindow = require('./screens/loggerWindow');
const setupSettings = require('./setupSettings');

const dev = process.env.ENV === 'dev';

const next = require('next');
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

if (process.env.ENV === 'dev') {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/../node_modules/electron`)
    });
}

nextApp.prepare().then(() => {
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
}).catch(ex => {
    console.error('Error during Next.js preparation:', ex.stack);
});
