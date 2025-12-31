import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationService from "../../api/notificationService";

const initialState = {
  notifications: [],
  unreadCount: 0,
  listStatus: "idle",
  error: null,
};

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "notifications_fetch_error" }
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "notifications_update_error",
        }
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      if (state.notifications.length > 0) {
        state.notifications.unshift(action.payload);
      }
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.listStatus = "succeeded";
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
