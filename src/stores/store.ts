import {combineReducers, configureStore, createAction } from '@reduxjs/toolkit';
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

// In your Redux slice
export const updateOptionIV = createAction('options/updateOptionIV', (payload) => {
  return { payload };
});



export type AppDispatch = typeof store.dispatch;
