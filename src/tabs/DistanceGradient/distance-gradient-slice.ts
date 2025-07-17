import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface DistanceGradientState {
  colorStops: ColorStop[];
  selectedStopId: string;
}

const initialState: DistanceGradientState = {
  colorStops: [
    { id: '1', color: '#2A7B9B', position: 0 },
    { id: '2', color: '#57C785', position: 31 },
    { id: '3', color: '#EDDD53', position: 100 }
  ],
  selectedStopId: '2'
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
      state.selectedStopId = newId;
    },
    removeColorStop: (state, action: PayloadAction<string>) => {
      if (state.colorStops.length > 2) {
        state.colorStops = state.colorStops.filter(stop => stop.id !== action.payload);
        if (state.selectedStopId === action.payload) {
          state.selectedStopId = state.colorStops[0]?.id || '';
        }
      }
    },
    setSelectedStop: (state, action: PayloadAction<string>) => {
      state.selectedStopId = action.payload;
    }
  }
});

export const {
  updateColorStop,
  addColorStop,
  removeColorStop,
  setSelectedStop
} = distanceGradientSlice.actions;

export default distanceGradientSlice.reducer; 