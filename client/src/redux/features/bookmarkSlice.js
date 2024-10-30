import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: [] };

export const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    setBookmarkList: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { setBookmarkList } = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
