import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '../../api/notificationService';

const initialState = {
  notifications: [],
  unreadCount: 0,
  status: 'idle',
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Reducer to add a new notification from a WebSocket message
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload); // Add to the top of the list
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.status = 'succeeded';
      })
      .addCase(markAsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications.forEach(n => { n.isRead = true; });
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
