import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SVGDLAUITool = 'draw-with-lines' | 'draw-with-squares';
export interface SVGDLAUIState {
  lineLength: number;
  svgContent: string;
  selectedTool: SVGDLAUITool;
}

const initialState: SVGDLAUIState = {
  lineLength: 2,
  svgContent: '',
  selectedTool: 'draw-with-lines',
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
    setSelectedTool(state, action: PayloadAction<SVGDLAUITool>) {
      state.selectedTool = action.payload;
    },
  },
});

export const { setLineLength, setSvgContent, setSelectedTool } = slice.actions;
export default slice.reducer; 