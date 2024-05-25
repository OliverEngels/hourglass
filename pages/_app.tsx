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
        </Provider>
    );
}

export default App;