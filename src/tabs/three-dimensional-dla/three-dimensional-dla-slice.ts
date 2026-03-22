import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PARTICLES_3D, DEFAULT_SPAWN_RADIUS } from './three-dimensional-dla-constants';
import type { Point3D, ClusterMap3D } from './dla-3d';

export interface ThreeDimensionalDLAState {
  isRunning: boolean;
  numParticles: number;
  spawnSphereRadius: number;
  walkers: Point3D[];
  cluster: ClusterMap3D;
  steps: number;
}

const initialState: ThreeDimensionalDLAState = {
  isRunning: false,
  numParticles: DEFAULT_PARTICLES_3D,
  spawnSphereRadius: DEFAULT_SPAWN_RADIUS,
  walkers: [],
  cluster: {},
  steps: 0,
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
    addWalkers(state, action: PayloadAction<Point3D[]>) {
      state.walkers = [...state.walkers, ...action.payload];
    },
    saveDLA3DState(state, action: PayloadAction<{ cluster: ClusterMap3D; walkers: Point3D[]; steps: number }>) {
      state.cluster = action.payload.cluster;
      state.walkers = action.payload.walkers;
      state.steps = action.payload.steps;
    },
    resetState(state) {
      state.isRunning = false;
      state.walkers = [];
      state.cluster = {};
      state.steps = 0;
    },
  },
});

export const {
  setIsRunning,
  setNumParticles,
  setSpawnSphereRadius,
  addWalkers,
  saveDLA3DState,
  resetState,
} = slice.actions;

export default slice.reducer;
