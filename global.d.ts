export { };

declare global {
    interface Window {
        electron: {
            openEntriesWindow: () => void;
            openTagsWindow: () => void;
            minimize: () => void;
            maximize: () => void;
            closeWindow: () => void;
        };
    }
}
