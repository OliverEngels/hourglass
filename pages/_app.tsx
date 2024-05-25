import React from 'react';
import WindowControls from '../components/window-controls.client';
import "../styles/globals.css";
import { Provider } from 'react-redux';
import store from '@redux/store';

function App({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <WindowControls />
            <Component {...pageProps} />
            <div className="mt-3 text-xs flex justify-center gap-x-2 text-gray-500">
                <span className="cursor-pointer hover:underline select-none" onClick={() => { window.electron.openEntriesWindow(); }}>Entries</span>
                /
                <span className="cursor-pointer hover:underline select-none" onClick={() => { window.electron.openTagsWindow(); }}>Tags</span>
            </div>
        </Provider>
    );
}

export default App;