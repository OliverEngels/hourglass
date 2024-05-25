export { };

declare global {
    interface Window {
        electron: {
            openEntriesWindow: (from) => void;
            openTagsWindow: (from) => void;
            openLoggerWindow: (from) => void;
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
