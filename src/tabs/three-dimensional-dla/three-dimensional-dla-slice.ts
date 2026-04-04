import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PARTICLES_3D, DEFAULT_SPAWN_RADIUS, DEFAULT_STICK_DISTANCE, DEFAULT_CENTER_STICKY, DEFAULT_FLOOR_STICKY } from './three-dimensional-dla-constants';
import type { Point3D, ClusterMap3D } from './dla-3d';

export interface ThreeDimensionalDLAState {
  isRunning: boolean;
  numParticles: number;
  spawnSphereRadius: number;
  stickDistance: number;
  centerSticky: boolean;
  floorSticky: boolean;
  walkers: Point3D[];
  cluster: ClusterMap3D;
  steps: number;
}

const initialState: ThreeDimensionalDLAState = {
  isRunning: false,
  numParticles: DEFAULT_PARTICLES_3D,
  spawnSphereRadius: DEFAULT_SPAWN_RADIUS,
  stickDistance: DEFAULT_STICK_DISTANCE,
  centerSticky: DEFAULT_CENTER_STICKY,
  floorSticky: DEFAULT_FLOOR_STICKY,
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
    setStickDistance(state, action: PayloadAction<number>) {
      state.stickDistance = action.payload;
    },
    setCenterSticky(state, action: PayloadAction<boolean>) {
      state.centerSticky = action.payload;
    },
    setFloorSticky(state, action: PayloadAction<boolean>) {
      state.floorSticky = action.payload;
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
      state.stickDistance = DEFAULT_STICK_DISTANCE;
      state.centerSticky = DEFAULT_CENTER_STICKY;
      state.floorSticky = DEFAULT_FLOOR_STICKY;
    },
  },
});

export const {
  setIsRunning,
  setNumParticles,
  setSpawnSphereRadius,
  setStickDistance,
  setCenterSticky,
  setFloorSticky,
  addWalkers,
  saveDLA3DState,
  resetState,
} = slice.actions;

export default slice.reducer;
