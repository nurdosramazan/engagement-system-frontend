import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from '../../api/appointmentService';

const initialState = {
  myAppointments: [],
  availableSlots: [],
  status: 'idle',
  error: null,
};

// fetchMyAppointments, fetchAvailableSlots, and cancelUserAppointment thunks are unchanged...
export const fetchMyAppointments = createAsyncThunk(
  'appointments/fetchMyAppointments',
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
  'appointments/fetchAvailableSlots',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(year, month);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelUserAppointment = createAsyncThunk(
  'appointments/cancelUserAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
        await appointmentService.cancelUserAppointment(appointmentId);
        return appointmentId;
    } catch(error) {
        return rejectWithValue(error.response.data);
    }
  }
);


// The key change is in the bookAppointment thunk
export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      return response.data.data;
    } catch (error) {
      // **IMPROVEMENT**: Check for specific validation errors from the backend
      if (error.response && error.response.data && error.response.data.data) {
        // This is for MethodArgumentNotValidException which returns a list of FieldError
        return rejectWithValue({
          message: error.response.data.message,
          fieldErrors: error.response.data.data
        });
      }
      return rejectWithValue(error.response.data);
    }
  }
);


const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetching user's own appointments
      .addCase(fetchMyAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myAppointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cases for fetching available slots
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.availableSlots = action.payload;
      })
      // Cases for creating a new appointment
      .addCase(bookAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bookAppointment.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Case for cancelling an appointment
      .addCase(cancelUserAppointment.fulfilled, (state, action) => {
        // Update the status of the cancelled appointment in the local state
        const index = state.myAppointments.findIndex(app => app.id === action.payload);
        if (index !== -1) {
            state.myAppointments[index].status = 'CANCELLED';
        }
      });
  },
});

export default appointmentSlice.reducer;

