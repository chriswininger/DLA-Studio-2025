import { createSlice } from '@reduxjs/toolkit';

export interface NavigationState {
  currentTab: string;
  isInitialized: boolean;
}

const initialState: NavigationState = {
  currentTab: '/about', // Default to about tab
  isInitialized: false,
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    initializeFromStorage: (state, action) => {
      if (action.payload) {
        state.currentTab = action.payload;
      }
      state.isInitialized = true;
    },
  },
});

export const { setCurrentTab, setInitialized, initializeFromStorage } = navigationSlice.actions;
export default navigationSlice.reducer;
