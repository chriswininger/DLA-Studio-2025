import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PARTICLES } from './simple-2d-animated-dla-constants';

export type Simple2DAnimatedDLATool = 'brush' | 'eraser' | 'spawn-shapes';
export interface Simple2DAnimatedDLAUIState {
  numParticles: number;
  spawnXOffset: number;
  spawnYOffset: number;
  spawnRotation: number;
  spawnSquareSize: number;
  brushSize: number;
  brushParticles: number;
  eraserSize: number;
  isRunning: boolean;
  selectedTool: Simple2DAnimatedDLATool;
}

const initialState: Simple2DAnimatedDLAUIState = {
  numParticles: DEFAULT_PARTICLES,
  spawnXOffset: 0,
  spawnYOffset: 0,
  spawnRotation: 0,
  spawnSquareSize: 100,
  brushSize: 10,
  brushParticles: 100,
  eraserSize: 10,
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
    setSpawnXOffset(state, action: PayloadAction<number>) {
      state.spawnXOffset = action.payload;
    },
    setSpawnYOffset(state, action: PayloadAction<number>) {
      state.spawnYOffset = action.payload;
    },
    setSpawnRotation(state, action: PayloadAction<number>) {
      state.spawnRotation = action.payload;
    },
    setSpawnSquareSize(state, action: PayloadAction<number>) {
      state.spawnSquareSize = action.payload;
    },
    setBrushSize(state, action: PayloadAction<number>) {
      state.brushSize = action.payload;
    },
    setBrushParticles(state, action: PayloadAction<number>) {
      state.brushParticles = action.payload;
    },
    setEraserSize(state, action: PayloadAction<number>) {
      state.eraserSize = action.payload;
    },
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setSelectedTool(state, action: PayloadAction<Simple2DAnimatedDLATool>) {
      state.selectedTool = action.payload;
    },
  },
});

export const { setNumParticles, setSpawnXOffset, setSpawnYOffset, setSpawnRotation, setSpawnSquareSize, setBrushSize, setBrushParticles, setEraserSize, setIsRunning, setSelectedTool } = slice.actions;
export default slice.reducer; 