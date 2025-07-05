import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PARTICLES } from './simple-2d-animated-dla-constants';

export type Simple2DAnimatedDLATool = 'brush' | 'eraser';
export interface Simple2DAnimatedDLAUIState {
  numParticles: number;
  isRunning: boolean;
  selectedTool: Simple2DAnimatedDLATool;
}

const initialState: Simple2DAnimatedDLAUIState = {
  numParticles: DEFAULT_PARTICLES,
  isRunning: false,
  selectedTool: 'brush',
};

const slice = createSlice({
  name: 'simple2dAnimatedDlaUI',
  initialState,
  reducers: {
    setNumParticles(state, action: PayloadAction<number>) {
      state.numParticles = action.payload;
    },
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setSelectedTool(state, action: PayloadAction<Simple2DAnimatedDLATool>) {
      state.selectedTool = action.payload;
    },
  },
});

export const { setNumParticles, setIsRunning, setSelectedTool } = slice.actions;
export default slice.reducer; 