import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentReducer from '../features/appointment/appointmentSlice';
import userReducer from '../features/user/userSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    user: userReducer,
    admin: adminReducer,
  },
});