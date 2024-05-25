import { combineReducers } from '@reduxjs/toolkit';
import tagReducer from './tags';
import entryReducer from './entries';
import logReducer from './log';

const rootReducer = combineReducers({
    tagState: tagReducer,
    entryState: entryReducer,
    logState: logReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;