import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      phoneNumber: decoded.sub,
      roles: decoded.roles,
    };
  } catch (error) {
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  user: getUserFromToken(localStorage.getItem('token')),
  status: 'idle',
  error: null,
};

export const requestOtp = createAsyncThunk('auth/requestOtp', async (phoneNumber) => {
  const response = await axiosInstance.post('/auth/request-otp', { phoneNumber });
  return response.data;
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ phoneNumber, otp }) => {
  const response = await axiosInstance.post('/auth/verify-otp', { phoneNumber, otp });
  return response.data.data.accessToken;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.token = action.payload;
        state.user = getUserFromToken(action.payload);
        localStorage.setItem('token', action.payload);
        state.status = 'succeeded';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;