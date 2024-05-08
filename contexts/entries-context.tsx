import { FC, ReactNode, createContext, useContext, useState } from 'react';
import { ApiResponse, TagData } from '../components/schemes/api-tag';
import { HttpRequestPromise } from '@components/http-request';

export interface Entry {
    date: Date;
    starttime: string;
    endtime: string;
    description: string;
    notes: string;
    tags: TagData[];
}

interface EntryContextType {
    entry: Entry | null;
    createEntry: (newEntry: Entry) => Promise<{ response?: ApiResponse; error?: any }>;
    clearEntry: () => void;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

export const EntryProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [entry, setEntryState] = useState<Entry | null>(null);

    const createEntry = async (newEntry: Entry): Promise<{ response: ApiResponse; error?: any; }> => {
        try {
            const data = await HttpRequestPromise('/api/entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEntry)
            });

            return data;
        } catch (error) {
            console.error('Error creating entry:', error);
            return { response: null, error: error.message || error };
        }
    };

    const clearEntry = () => {
        setEntryState(null);
    };

    return (
        <EntryContext.Provider value={{ entry, createEntry, clearEntry }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntry = () => {
    const context = useContext(EntryContext);
    if (context === undefined) {
        throw new Error('useEntry must be used within a EntryProvider');
    }
    return context;
};