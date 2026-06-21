import { configureStore } from '@reduxjs/toolkit';
import medicalReducer from './medicalSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    medical: medicalReducer,
    auth: authReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;