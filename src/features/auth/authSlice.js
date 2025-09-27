import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

// Helper to get user data from localStorage and process roles
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Remove the 'ROLE_' prefix for easier use in the frontend
    const roles = (decoded.roles || []).map(role => role.replace('ROLE_', ''));
    return {
      id: decoded.id,
      phoneNumber: decoded.sub,
      roles: roles,
    };
  } catch (error) {
    // If the token is invalid, remove it
    localStorage.removeItem('token');
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  user: getUserFromToken(localStorage.getItem('token')),
  status: 'idle',
  error: null,
};

export const requestOtp = createAsyncThunk('auth/requestOtp', async (phoneNumber, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/request-otp', { phoneNumber });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ phoneNumber, otp }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', { phoneNumber, otp });
    return response.data.data.accessToken;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
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
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const token = action.payload;
        state.token = token;
        state.user = getUserFromToken(token);
        localStorage.setItem('token', token);
        state.status = 'succeeded';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

