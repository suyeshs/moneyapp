import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
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
    setData: (state, action: PayloadAction<OptionData[]>) => {
      // Replace existing data with new data array
      state.data = action.payload.map(item => ({ ...item }));
    },
    updateData: (state, action: PayloadAction<OptionData>) => {
      const index = state.data.findIndex(item => item.strikePrice === action.payload.strikePrice);
      //console.log("Update Index",index);
      // Ensure the ind ex is within the bounds of the data array
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...action.payload };
      } else {
        // Handle case where the item doesn’t exist
        state.data.push(action.payload);
        
        console.log('Previous State:', JSON.parse(JSON.stringify(state)));
        //console.log('payload:', action.payload);
      }
      }

    
  },
 
  
  
});

export const { setData, updateData } = websocketSlice.actions;
export default websocketSlice.reducer;
