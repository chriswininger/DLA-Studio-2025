import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SVGDLAUITool = 'draw-with-lines' | 'draw-with-squares';
export interface SVGDLAUIState {
  lineLength: number;
  svgContent: string;
  selectedTool: SVGDLAUITool;
  squareSize: number;
  showCircles: boolean;
  circleRadius: number;
  onlyVisible: boolean;
}

const initialState: SVGDLAUIState = {
  lineLength: 2,
  svgContent: '',
  selectedTool: 'draw-with-lines',
  squareSize: 10,
  showCircles: true,
  circleRadius: 2,
  onlyVisible: true,
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
    setSquareSize(state, action: PayloadAction<number>) {
      state.squareSize = action.payload;
    },
    setShowCircles(state, action: PayloadAction<boolean>) {
      state.showCircles = action.payload;
    },
    setCircleRadius(state, action: PayloadAction<number>) {
      state.circleRadius = action.payload;
    },
    setOnlyVisible(state, action: PayloadAction<boolean>) {
      state.onlyVisible = action.payload;
    },
  },
});

export const { setLineLength, setSvgContent, setSelectedTool, setSquareSize, setShowCircles, setCircleRadius, setOnlyVisible } = slice.actions;
export default slice.reducer; 