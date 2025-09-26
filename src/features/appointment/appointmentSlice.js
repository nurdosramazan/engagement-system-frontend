import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as appointmentService from '../../api/appointmentService';

const initialState = {
  appointments: [],
  availableSlots: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async Thunks
export const fetchMyAppointments = createAsyncThunk('appointments/fetchMyAppointments', async () => {
  const appointments = await appointmentService.getMyAppointments();
  return appointments;
});

export const fetchAvailableSlots = createAsyncThunk('appointments/fetchAvailableSlots', async ({ year, month }) => {
    const slots = await appointmentService.getAvailableSlots(year, month);
    return slots;
});

export const bookAppointment = createAsyncThunk('appointments/bookAppointment', async (formData) => {
    const newAppointment = await appointmentService.createAppointment(formData);
    return newAppointment;
});

export const cancelUserAppointment = createAsyncThunk('appointments/cancelUserAppointment', async (appointmentId) => {
    await appointmentService.cancelAppointment(appointmentId);
    return appointmentId;
});


const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch user's appointments
      .addCase(fetchMyAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Fetch available slots
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
          state.availableSlots = action.payload;
      })
      // Create appointment
      .addCase(bookAppointment.fulfilled, (state, action) => {
          state.appointments.push(action.payload);
      })
      // Cancel appointment
      .addCase(cancelUserAppointment.fulfilled, (state, action) => {
          const id = action.payload;
          const existingAppointment = state.appointments.find(app => app.id === id);
          if (existingAppointment) {
              existingAppointment.status = 'CANCELLED';
          }
      });
  },
});

export default appointmentSlice.reducer;
