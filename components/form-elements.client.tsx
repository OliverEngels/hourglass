import { useState } from "react";

interface InputProps {
    title: string
    placeholder: string
    value: string
    setValueOnDoubleClick?: Function
    setValueOnChange?: Function
    setValueOnEnter?: Function
    error?: string
}
export const Input: React.FC<InputProps> = ({ title, placeholder, value, setValueOnDoubleClick, setValueOnChange, setValueOnEnter, error }) => {
    const handleDoubleClick = (e) => {
        setValueOnDoubleClick && setValueOnDoubleClick(e, placeholder);
    };

    const handleKeyDown = (e) => {
        if (e.key == 'Enter') {
            setValueOnEnter && setValueOnEnter(e)
        }
    }

    const handleOnChange = (e) => {
        setValueOnChange && setValueOnChange(e);
    }

    return (
        <div className="relative mt-5 w-full">
            <input
                name={title}
                id={title}
                className={`peer block w-full rounded-md border-0 py-2.5 pl-3 pr-2.5 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200 ${error != null && error != "" && " ring-red-400 ring-2"}`}
                placeholder={placeholder}
                value={value.toString()}
                onChange={(e) => handleOnChange(e)}
                onKeyDown={(e) => handleKeyDown(e)}
                onDoubleClick={(e) => handleDoubleClick(e)}
            />
            {error != null && error != "" && <p className="text-red-400 text-xs">{error}</p>}
            <label
                className={`absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out  peer-focus:text-sm  peer-focus:text-indigo-600 bg-slate-200 px-2 text-sm font-medium ${error != null && error != "" && " text-red-400"}`}
            >
                {title}
            </label>
        </div>
    )
}

export const TextArea: React.FC<InputProps> = ({ title, placeholder, value, setValueOnDoubleClick, setValueOnChange, setValueOnEnter, error }) => {
    const handleDoubleClick = (e) => {
        setValueOnDoubleClick && setValueOnDoubleClick(e, placeholder);
    };

    const handleKeyDown = (e) => {
        if (e.key == 'Enter') {
            setValueOnEnter && setValueOnEnter(value)
        }
    }

    const handleOnChange = (e) => {
        setValueOnChange && setValueOnChange(e);
    }

    return (
        <div className="relative mt-5 w-full">
            <textarea
                rows={2}
                cols={5}
                name={title}
                id={title}
                value={value.toString()}
                onChange={(e) => handleOnChange(e)}
                onKeyDown={(e) => handleKeyDown(e)}
                onDoubleClick={(e) => handleDoubleClick(e)}
                className={`peer block w-full rounded-md border-0 py-2.5 pl-3 pr-2.5 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200 ${error != null && error != "" && " ring-red-400 ring-2"}`}
                placeholder={placeholder}
            />
            {error != null && error != "" && <p className="text-red-400 text-xs">{error}</p>}
            <label
                className={`absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out  peer-focus:text-indigo-600 peer-focus:text-sm bg-slate-200 px-2 text-sm font-medium ${error != null && error != "" && " text-red-400"}`}
            >
                {title}
            </label>
        </div>
    )
}

export const Currency: React.FC<InputProps> = ({ title, placeholder }) => {
    return (
        <div className="relative mt-5 w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
                type="text"
                name="price"
                id="price"
                className="peer block w-full rounded-md border-0 py-2.5 pl-3 pr-2.5 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200"
                placeholder="0.00"
            />
            <label
                className="absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out  peer-focus:text-sm  peer-focus:text-indigo-600 bg-slate-200 px-2 text-sm font-medium"
            >
                {title}
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">
                    Currency
                </label>
                <p
                    className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 sm:text-sm"
                >
                    <span className="absolute top-1.5 right-2" id="currency">EUR</span>
                </p>
            </div>
        </div>
    )
}