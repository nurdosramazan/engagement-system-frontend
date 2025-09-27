import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../api/userService';

const initialState = {
  profile: null,
  status: 'idle',
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
        const response = await userService.updateUserProfile(profileData);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = 'succeeded';
      });
  },
});

export default userSlice.reducer;
