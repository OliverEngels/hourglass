import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Tag } from './tags';

export interface Entry {
    id: string,
    date: string,
    description: string,
    starttime: string,
    endtime: string,
    notes: string,
    tags: Tag[]
}

interface entriesState {
    entries: Entry[]
}

const initialState: entriesState = {
    entries: []
};

export const Entries = createSlice({
    name: 'entries',
    initialState,
    reducers: {
        createEntries: (state, action: PayloadAction<Entry[]>) => {
            state.entries = action.payload;
        },
        createEntry: (state, action: PayloadAction<Entry>) => {
            state.entries.push(action.payload);
        },
        deleteEntry: (state, action: PayloadAction<{ id: string }>) => {
            state.entries = state.entries.filter(entry => entry.id !== action.payload.id);
        },
        updateEntry: (state, action: PayloadAction<{ id: string, updatedEntryData: Entry }>) => {
            const existingEntry = state.entries.find(entry => entry.id === action.payload.id);
            if (existingEntry) {
                Object.assign(existingEntry, action.payload.updatedEntryData);
            }
        }
    },
});

export const { createEntries, createEntry, deleteEntry, updateEntry } = Entries.actions;

export default Entries.reducer;