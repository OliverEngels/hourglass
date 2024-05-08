import { useRef, useState } from "react";


interface Props {
    id: number
    onDelete: (id: any) => void;
}

const DeleteButton = ({ id, onDelete }: Props) => {
    const cancelBtnRef = useRef<HTMLDivElement>(null);
    const approveBtnRef = useRef<HTMLDivElement>(null);
    const deleteBtnRef = useRef<HTMLDivElement>(null);

    const handleDeleteClick = () => {
        setTimeout(() => {
            if (cancelBtnRef.current && approveBtnRef.current && deleteBtnRef.current) {
                cancelBtnRef.current.style.opacity = '1';
                approveBtnRef.current.style.opacity = '1';
                deleteBtnRef.current.style.display = 'none';
            }
        }, 350);
        if (deleteBtnRef.current) {
            deleteBtnRef.current.style.opacity = '0';
            cancelBtnRef.current.style.display = 'flex';
            approveBtnRef.current.style.display = 'flex';
        }
    };
    const handleCancelClick = () => {
        setTimeout(() => {
            if (deleteBtnRef.current) {
                deleteBtnRef.current.style.opacity = '1';
                deleteBtnRef.current.style.display = 'flex';
                approveBtnRef.current.style.display = 'none';
                cancelBtnRef.current.style.display = 'none';
            }
        }, 350);
        if (cancelBtnRef.current && approveBtnRef.current) {
            cancelBtnRef.current.style.opacity = '0';
            approveBtnRef.current.style.opacity = '0';
        }
    };
    const handleConfirmClick = () => {
        onDelete(id);
        if (cancelBtnRef.current && approveBtnRef.current && deleteBtnRef.current) {
            cancelBtnRef.current.style.opacity = '0';
            approveBtnRef.current.style.opacity = '0';
            deleteBtnRef.current.style.opacity = '1';
            deleteBtnRef.current.style.display = 'flex';
        }
    };

    return (
        <div className="flex justify-end gap-x-2 flex-nowrap">
            <div className="relative flex flex-col items-center transition-opacity duration-500 ease-in-out opacity-0 peer-hover:opacity-100" ref={approveBtnRef}>
                <button className="peer rounded text-red-100 bg-red-500 hover:bg-red-700 relative fill-current  h-6 w-6 flex justify-center items-center" onClick={handleConfirmClick}>
                    <svg className={`h-5 w-5 p-0.5`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                    </svg>
                </button>
                <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100 pointer-events-none">
                    confirm
                </div>
            </div>
            <div className="relative flex flex-col items-center transition-opacity duration-500 ease-in-out opacity-0 peer-hover:opacity-100" ref={cancelBtnRef}>
                <button className="peer rounded text-gray-100 bg-gray-500 hover:bg-gray-700 relative fill-current h-6 w-6 flex justify-center items-center" onClick={handleCancelClick}>
                    <svg className={`h-5 w-5 p-0.5`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                    </svg>
                </button>
                <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100 pointer-events-none">
                    cancel
                </div>
            </div>
            <div className="relative flex flex-col items-center transition-opacity duration-500 ease-in-out opacity-1 peer-hover:opacity-100" ref={deleteBtnRef}>
                <button className="peer rounded text-red-100 bg-red-500 hover:bg-red-700 relative fill-current  h-6 w-6 flex justify-center items-center" onClick={handleDeleteClick}>
                    <svg className={`h-5 w-5 p-0.5`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
                </button>
                <div className="peer-hover:flex absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-700 rounded-md text-nowrap opacity-0 transition-opacity duration-200 peer-hover:opacity-100 pointer-events-none">
                    delete
                </div>
            </div>
        </div>
    );
};

export default DeleteButton;