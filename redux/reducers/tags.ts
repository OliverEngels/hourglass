import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tag {
    id: string;
    value: string;
    subtype: string;
    color: string;
}

interface tagState {
    tags: Tag[];
}

const initialState: tagState = {
    tags: []
};

export const Tags = createSlice({
    name: 'tags',
    initialState,
    reducers: {
        createTags: (state, action: PayloadAction<Tag[]>) => {
            state.tags = action.payload;
        },
        createTag: (state, action: PayloadAction<Tag>) => {
            state.tags.push(action.payload);
        },
        deleteTag: (state, action: PayloadAction<{ id: string }>) => {
            state.tags = state.tags.filter(tag => tag.id !== action.payload.id);
        },
        updateTag: (state, action: PayloadAction<{ id: string, updatedTagData: Tag }>) => {
            const existingTag = state.tags.find(tag => tag.id === action.payload.id);
            if (existingTag) {
                Object.assign(existingTag, action.payload.updatedTagData);
            }
        }
    },
});

export const { createTags, createTag, deleteTag, updateTag } = Tags.actions;
export default Tags.reducer;