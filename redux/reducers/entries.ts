import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    entries: []
};

export const Entries = createSlice({
    name: 'entries',
    initialState,
    reducers: {
        createEntries: (state, action) => {
            state.entries = action.payload;
        },
        createEntry: (state, action) => {
            state.entries.push(action.payload);
        },
        deleteEntry: (state, action) => {
            state.entries = state.entries.filter(entry => entry.id !== action.payload.id);
        },
        updateEntry: (state, action) => {
            const existingEntry = state.entries.find(entry => entry.id === action.payload.id);
            if (existingEntry) {
                Object.assign(existingEntry, action.payload.updatedEntryData);
            }
        }
    },
});

export const { createEntries, createEntry, deleteEntry, updateEntry } = Entries.actions;

export default Entries.reducer;