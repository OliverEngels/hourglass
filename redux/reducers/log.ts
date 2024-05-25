import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
        updateLog: (state, action) => {
            Object.assign(state, action.payload.log);
        },
    },
});

export const { updateLog } = Log.actions;
export default Log.reducer;