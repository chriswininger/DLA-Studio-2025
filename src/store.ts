import { configureStore } from '@reduxjs/toolkit';
import simple2dAnimatedDlaReducer from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla-slice';
import svgDlaReducer from './tabs/SVGDLA/svg-dla-slice';
import distanceGradientReducer from './tabs/DistanceGradient/distance-gradient-slice';
import navigationReducer from './navigation/navigation-slice';
import { useSelector, useDispatch } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    simple2dAnimatedDla: simple2dAnimatedDlaReducer,
    svgDla: svgDlaReducer,
    distanceGradient: distanceGradientReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
