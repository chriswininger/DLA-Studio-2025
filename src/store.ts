import { configureStore } from '@reduxjs/toolkit';
import simple2dAnimatedDlaReducer from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla-slice';
import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    simple2dAnimatedDla: simple2dAnimatedDlaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
