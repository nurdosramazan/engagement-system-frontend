import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminService from '../../api/adminService';

const initialState = {
  appointments: [],
  status: 'idle',
  error: null,
};

export const fetchAppointmentsByStatus = createAsyncThunk(
  'admin/fetchAppointmentsByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await adminService.getAppointmentsByStatus(status);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approveAdminAppointment = createAsyncThunk(
  'admin/approveAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await adminService.approveAppointment(appointmentId);
      return { data: response.data, id: appointmentId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectAdminAppointment = createAsyncThunk(
  'admin/rejectAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.rejectAppointment(id, reason);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const completeAdminAppointment = createAsyncThunk(
  'admin/completeAppointment',
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await adminService.completeAppointment(id, adminNotes);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const cancelAdminAppointment = createAsyncThunk(
  'admin/cancelAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.cancelAdminAppointment(id, reason);
      return { data: response.data, id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentsByStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(approveAdminAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (app) => app.id !== action.payload.id
        );
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
  },
});

export default adminSlice.reducer;
