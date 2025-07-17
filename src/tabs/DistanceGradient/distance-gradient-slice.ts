import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface DistanceGradientState {
  colorStops: ColorStop[];
}

const initialState: DistanceGradientState = {
  colorStops: [
    { id: '1', color: '#FF6C11', position: 0 },
    { id: '2', color: '#FF3864', position: 50 },
    { id: '3', color: '#2DE2E6', position: 100 }
  ]
};

const distanceGradientSlice = createSlice({
  name: 'distanceGradient',
  initialState,
  reducers: {
    updateColorStop: (
      state,
      action: PayloadAction<{ id: string; field: 'color' | 'position'; value: string | number }>
    ) => {
      const { id, field, value } = action.payload;
      const stop = state.colorStops.find(s => s.id === id);
      if (stop) {
        if (field === 'color') {
          stop.color = value as string;
        } else if (field === 'position') {
          stop.position = value as number;
        }
      }
    },
    addColorStop: (state) => {
      const newId = Date.now().toString();
      const newStop: ColorStop = {
        id: newId,
        color: '#ffffff',
        position: 50
      };
      state.colorStops.push(newStop);
    },
    removeColorStop: (state, action: PayloadAction<string>) => {
      if (state.colorStops.length > 2) {
        state.colorStops = state.colorStops.filter(stop => stop.id !== action.payload);
      }
    }
  }
});

export const {
  updateColorStop,
  addColorStop,
  removeColorStop,
} = distanceGradientSlice.actions;

export default distanceGradientSlice.reducer; 