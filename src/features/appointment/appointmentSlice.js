import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as appointmentService from "../../api/appointmentService";
import i18n from "../../i18n";

const initialState = {
  myAppointments: [],
  availableSlots: [],
  status: "idle",
  error: null,
  uploadProgress: 0,
};

export const fetchMyAppointments = createAsyncThunk(
  "appointments/fetchMyAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getMyAppointments();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  "appointments/fetchAvailableSlots",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(year, month);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const bookAppointment = createAsyncThunk(
  "appointments/bookAppointment",
  async (appointmentData, { rejectWithValue, dispatch }) => {
    try {
      const onUploadProgress = (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percent = Math.floor((loaded * 100) / total);
        dispatch(setUploadProgress(percent));
      };
      const response = await appointmentService.createAppointment(
        appointmentData,
        onUploadProgress
      );
      return response.data.data;
    } catch (error) {
      const errorCode = error.response?.data?.message || error.message;

      if (errorCode === "PROFILE_INCOMPLETE") {
        return rejectWithValue({
          message: errorCode,
          isProfileError: true,
          fieldErrors: error.response?.data?.fieldErrors,
        });
      }
      return rejectWithValue({
        message: errorCode,
        fieldErrors: error.response?.data?.fieldErrors,
      });
    }
  }
);

export const cancelUserAppointment = createAsyncThunk(
  "appointments/cancelUserAppointment",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelUserAppointment(
        id,
        reason
      );
      return { apiResponse: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myAppointments = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.status = "loading";
        state.uploadProgress = 0;
      })
      .addCase(bookAppointment.fulfilled, (state) => {
        state.status = "succeeded";
        state.uploadProgress = 0;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      .addCase(cancelUserAppointment.fulfilled, (state, action) => {
        const index = state.myAppointments.findIndex(
          (app) => app.id === action.payload.id
        );
        if (index !== -1) {
          state.myAppointments[index].status = "CANCELLED";
        }
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.availableSlots = action.payload;
      });
  },
});

export const { setUploadProgress } = appointmentSlice.actions;
export default appointmentSlice.reducer;
