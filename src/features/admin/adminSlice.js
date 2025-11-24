import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as adminService from "../../api/adminService";

const initialState = {
  appointments: [],
  status: "idle",
  error: null,
};

export const fetchAppointmentsByStatus = createAsyncThunk(
  "admin/fetchAppointmentsByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await adminService.getAppointmentsByStatus(status);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const rejectAdminAppointment = createAsyncThunk(
  "admin/rejectAppointment",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.rejectAppointment(id, reason);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const completeAdminAppointment = createAsyncThunk(
  "admin/completeAppointment",
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminService.completeAppointment(id, adminNotes);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);
export const cancelAdminAppointment = createAsyncThunk(
  "admin/cancelAppointment",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.cancelAdminAppointment(id, reason);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateAppointmentDetails = createAsyncThunk(
  "admin/updateAppointmentDetails",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateAppointmentDetails(id, data);
      return { id, ...data, success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "update_failed" }
      );
    }
  }
);

export const approveAppointment = createAsyncThunk(
  "admin/approveAppointment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminService.approveAppointment(id, data);
      return { id, assignedImam: data.assignedImam };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "approval_failed" }
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentsByStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.appointments = action.payload;
      })
      .addCase(rejectAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (app) => app.id !== action.payload.id
        );
      })
      .addCase(completeAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (app) => app.id !== action.payload.id
        );
      })
      .addCase(cancelAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (app) => app.id !== action.payload.id
        );
      });
    builder.addCase(updateAppointmentDetails.fulfilled, (state, action) => {
      const index = state.appointments.findIndex(
        (app) => app.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = {
          ...state.appointments[index],
          ...action.payload,
        };
      }
    });

    builder.addCase(approveAppointment.fulfilled, (state, action) => {
      const index = state.appointments.findIndex(
        (app) => app.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index].status = "APPROVED";
        state.appointments[index].assignedImam = action.payload.assignedImam;
      }
    });
  },
});

export default adminSlice.reducer;
