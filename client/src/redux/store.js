import { configureStore } from "@reduxjs/toolkit";
import userReducer from './features/userSlice';
import boardReducer from './features/boardSlice';
import bookmarkReducer from './features/bookmarkSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
    bookmarks: bookmarkReducer
  }
});