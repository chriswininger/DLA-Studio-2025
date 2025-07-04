import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createDLAState, stepDLA } from '../../dla/dla';
import type { DLAState } from '../../dla/dla';
import { CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_PARTICLES } from './simple-2d-animated-dla-constants';

// Only UI state!
export interface Simple2DAnimatedDLAUIState {
  numParticles: number;
  isRunning: boolean;
}

const initialState: Simple2DAnimatedDLAUIState = {
  numParticles: DEFAULT_PARTICLES,
  isRunning: false,
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
  },
});

export const { setNumParticles, setIsRunning } = slice.actions;
export default slice.reducer; 