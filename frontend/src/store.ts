import { configureStore } from '@reduxjs/toolkit';
import medicalReducer from './rtk/medical/medicalSlice';
import authReducer from './rtk/auth/authSlice';

export const store = configureStore({
  reducer: {
    medical: medicalReducer,
    auth: authReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;