import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SVGDLAUIState {
  lineLength: number;
}

const initialState: SVGDLAUIState = {
  lineLength: 2,
};

const slice = createSlice({
  name: 'svgDlaUI',
  initialState,
  reducers: {
    setLineLength(state, action: PayloadAction<number>) {
      state.lineLength = action.payload;
    },
  },
});

export const { setLineLength } = slice.actions;
export default slice.reducer; 