import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PARTICLES_3D, DEFAULT_SPAWN_RADIUS } from './three-dimensional-dla-constants';

export interface Walker3D {
  x: number;
  y: number;
  z: number;
}

export interface ThreeDimensionalDLAState {
  isRunning: boolean;
  numParticles: number;
  spawnSphereRadius: number;
  walkers: Walker3D[];
}

const initialState: ThreeDimensionalDLAState = {
  isRunning: false,
  numParticles: DEFAULT_PARTICLES_3D,
  spawnSphereRadius: DEFAULT_SPAWN_RADIUS,
  walkers: [],
};

const slice = createSlice({
  name: 'threeDimensionalDla',
  initialState,
  reducers: {
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
    },
    setNumParticles(state, action: PayloadAction<number>) {
      state.numParticles = action.payload;
    },
    setSpawnSphereRadius(state, action: PayloadAction<number>) {
      state.spawnSphereRadius = action.payload;
    },
    addWalkers(state, action: PayloadAction<Walker3D[]>) {
      state.walkers = [...state.walkers, ...action.payload];
    },
    clearWalkers(state) {
      state.walkers = [];
    },
    resetState(state) {
      state.isRunning = false;
      state.walkers = [];
    },
  },
});

export const {
  setIsRunning,
  setNumParticles,
  setSpawnSphereRadius,
  addWalkers,
  clearWalkers,
  resetState,
} = slice.actions;

export default slice.reducer;
