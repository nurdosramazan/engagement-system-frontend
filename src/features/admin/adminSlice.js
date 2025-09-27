import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// FIX: Use a namespace import to get all named exports
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
        await adminService.approveAppointment(appointmentId);
        return appointmentId;
    } catch(error) {
        return rejectWithValue(error.response.data);
    }
  }
);

// ... other thunks remain the same, using adminService.functionName ...
export const rejectAdminAppointment = createAsyncThunk(
  'admin/rejectAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
        await adminService.rejectAppointment(id, reason);
        return id;
    } catch(error) {
        return rejectWithValue(error.response.data);
    }
  }
);

export const completeAdminAppointment = createAsyncThunk(
  'admin/completeAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
        await adminService.completeAppointment(appointmentId);
        return appointmentId;
    } catch(error) {
        return rejectWithValue(error.response.data);
    }
  }
);
export const cancelAdminAppointment = createAsyncThunk(
  'admin/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
        await adminService.cancelAppointment(appointmentId);
        return appointmentId;
    } catch(error) {
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
      .addCase(fetchAppointmentsByStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointmentsByStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
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

