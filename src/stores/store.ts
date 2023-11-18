import {combineReducers, configureStore } from '@reduxjs/toolkit';
import websocketReducer from './websocketSlice';

const rootReducer = combineReducers({
  websocket: websocketReducer,
  // other reducers...
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  // other store setup...
});


export type AppDispatch = typeof store.dispatch;
