import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../api/userService';

const initialState = {
  profile: null,
  status: 'idle',
  error: null,
};

export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile', async () => {
    const profile = await userService.getUserProfile();
    return profile;
});

export const saveUserProfile = createAsyncThunk('user/saveUserProfile', async (profileData) => {
    const updatedProfile = await userService.updateUserProfile(profileData);
    return updatedProfile;
});

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
                state.error = action.error.message;
            })
            .addCase(saveUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            });
    }
});

export default userSlice.reducer;
