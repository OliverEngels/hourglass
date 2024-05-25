import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Tag } from './tags';

export interface Log {
    id?: string,
    date?: string,
    starttime?: string,
    endtime?: string,
    description?: string,
    notes?: string,
    tags?: Tag[]
}

const initialState: Log = {
    id: '',
    date: new Date(Date.now()).toISOString(),
    starttime: '',
    endtime: '',
    description: '',
    notes: '',
    tags: []
};

export const Log = createSlice({
    name: 'log',
    initialState,
    reducers: {
        updateLog: (state, action: PayloadAction<Log>) => {
            Object.assign(state, action.payload);
        },
        setLog: (state, action: PayloadAction<Log>) => {
            state = action.payload;
        }
    },
});

export const { updateLog, setLog } = Log.actions;
export default Log.reducer;