import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SVGDLAUIState {
  lineLength: number;
  svgContent: string;
}

const initialState: SVGDLAUIState = {
  lineLength: 2,
  svgContent: '',
};

const slice = createSlice({
  name: 'svgDlaUI',
  initialState,
  reducers: {
    setLineLength(state, action: PayloadAction<number>) {
      state.lineLength = action.payload;
    },
    setSvgContent(state, action: PayloadAction<string>) {
      state.svgContent = action.payload;
    },
  },
});

export const { setLineLength, setSvgContent } = slice.actions;
export default slice.reducer; 