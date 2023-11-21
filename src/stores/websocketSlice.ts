import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {OptionData} from '../types';


interface WebSocketState {
  data: OptionData[]; // Use the specific type for your data
}

const initialState: WebSocketState = {
  data: [],
};

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<OptionData>) => {
      const index = state.data.findIndex(item => item.strikePrice === action.payload.strikePrice);
      if (index !== -1) {
        // Update existing entry
        state.data[index] = { ...state.data[index], ...action.payload };
      } else {
        // Add new entry
        state.data.push(action.payload);
      }
    },

    // Reducer to update a specific element in the data array
    updateData: (state, action) => {
      const index = state.data.findIndex(item => item.strikePrice === action.payload.strikePrice);
      if (index !== -1) {
        state.data[index] = {...state.data[index], ...action.payload};
      }
    },
  }
});

export const { setData, updateData } = websocketSlice.actions;
export default websocketSlice.reducer;
