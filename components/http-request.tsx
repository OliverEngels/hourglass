import { useState, useEffect } from 'react';
import { ApiResponse } from './schemes/api-tag';

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: { [key: string]: string };
    body?: string;
}

export async function HttpRequestPromise(
    urlOrUrlCreator: string | (() => string),
    options: FetchOptions = {}
): Promise<{ success: boolean, data?: any }> {
    try {
        const url = typeof urlOrUrlCreator === 'function' ? urlOrUrlCreator() : urlOrUrlCreator;
        if (!url) {
            throw new Error('URL is not defined.');
        }
        const value = await window.electron.getStoreValue('serverIp');
        const fetchUrl = value + url;

        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(fetchUrl, fetchOptions);
        const responseJson = await response.json();
        if (!response.ok || !responseJson.success) {
            throw new Error(responseJson.message || 'An error occurred');
        }
        return responseJson;
    } catch (error) {
        return Promise.reject(error.message || error.toString());
    }
}


export function HttpRequest(url: string, options: FetchOptions = {}): { response: ApiResponse, isLoading: boolean, error: any } {
    const [state, setState] = useState({ response: null, isLoading: true, error: null });

    useEffect(() => {
        HttpRequestPromise(url, options)
            .then((response) => {
                setState({ response: response, isLoading: false, error: null });
            })
            .catch(_error => {
                setState({ response: null, isLoading: false, error: _error });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}