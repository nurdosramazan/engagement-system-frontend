import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminService from '../../api/adminService';

const initialState = {
  appointments: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks ---
export const fetchAppointmentsByStatus = createAsyncThunk(
  'admin/fetchAppointmentsByStatus',
  async (status) => {
    const response = await adminService.getAppointmentsByStatus(status);
    return response.data;
  }
);

export const approveAdminAppointment = createAsyncThunk(
  'admin/approveAppointment',
  async (appointmentId) => {
    await adminService.approveAppointment(appointmentId);
    return appointmentId;
  }
);

export const rejectAdminAppointment = createAsyncThunk(
  'admin/rejectAppointment',
  async ({ id, reason }) => {
    await adminService.rejectAppointment(id, reason);
    return id;
  }
);

export const completeAdminAppointment = createAsyncThunk(
  'admin/completeAppointment',
  async (appointmentId) => {
    await adminService.completeAppointment(appointmentId);
    return appointmentId;
  }
);

// --- Slice Definition ---
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentsByStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointmentsByStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Optimistically update the UI by removing the appointment from the list
      .addCase(approveAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter((app) => app.id !== action.payload);
      })
      .addCase(rejectAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter((app) => app.id !== action.payload);
      })
      .addCase(completeAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter((app) => app.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;

