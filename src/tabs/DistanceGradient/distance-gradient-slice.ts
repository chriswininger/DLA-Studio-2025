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

// Utility: Interpolate color for a given distance
export function getColorForDistance(
  colorStops: ColorStop[],
  distance: number,
  minDistance: number,
  maxDistance: number
): string {
  if (colorStops.length === 0) return '#ffff00';
  // Normalize distance to 0-100
  let value = 0;
  if (maxDistance !== minDistance) {
    value = ((distance - minDistance) / (maxDistance - minDistance)) * 100;
  }
  // Sort stops by position
  const sorted = [...colorStops].sort((a, b) => a.position - b.position);
  if (value <= sorted[0].position) return sorted[0].color;
  if (value >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;
  // Find stops to interpolate between
  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i], right = sorted[i + 1];
    if (value >= left.position && value <= right.position) {
      const t = (value - left.position) / (right.position - left.position);
      return interpolateColor(left.color, right.color, t);
    }
  }
  return sorted[0].color;
}

function interpolateColor(color1: string, color2: string, t: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
} 