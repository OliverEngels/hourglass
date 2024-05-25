import React from 'react';

const WindowControls = () => {
    return (
        <div className='fixed top-0 left-0 w-full h-15 z-30 app-region-drag'>
            <div className="flex space-x-2 p-4">
                <button onClick={() => window.electron.closeWindow()} className="bg-red-500 w-3 h-3 rounded-full hover:bg-red-700 z-10 app-region-no-drag"></button>
                <button onClick={() => window.electron.minimize()} className="bg-yellow-500 w-3 h-3 rounded-full hover:bg-yellow-700 z-10 app-region-no-drag"></button>
                <button onClick={() => window.electron.maximize()} className="bg-green-500 w-3 h-3 rounded-full hover:bg-green-700 z-10 app-region-no-drag"></button>
            </div>
            <div className="w-full h-10 fixed left-0 top-0 backdrop-blur-md bg-cover bg-center" />
        </div>
    );
};

export default WindowControls;
