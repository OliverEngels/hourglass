export { };

declare global {
    interface Window {
        electron: {
            openEntriesWindow: () => void;
            openTagsWindow: () => void;
            openLoggerWindow: () => void;
            minimize: () => void;
            maximize: () => void;
            closeWindow: () => void;
            getStoreValue: (key) => promise;
            setStoreValue: (key, value) => promise;
            sendUpdate: (data: any) => void;
            onDataUpdate: (callback: (data: any) => void) => void;
            removeDataUpdate: (callback: (data: any) => void) => void;
        };
    }
}
