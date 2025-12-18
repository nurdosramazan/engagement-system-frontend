import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as adminService from "../../api/adminService";

const initialState = {
  appointments: [],
  imamsList: [],
  totalElements: 0,
  totalPages: 0,
  status: "idle",
  error: null,
};

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

export const fetchActiveImams = createAsyncThunk(
  "admin/fetchImams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getActiveImams();
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchFilteredAppointments = createAsyncThunk(
  "admin/fetchFilteredAppointments",
  async (
    { page, size, search, status, startDate, endDate },
    { rejectWithValue }
  ) => {
    try {
      const params = { page, size };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await adminService.fetchFilteredAppointments(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

    builder.addCase(fetchActiveImams.pending, (state) => {
      state.status = "loading";
    });

    builder.addCase(fetchActiveImams.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.imamsList = action.payload;
    });

    builder.addCase(fetchActiveImams.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder
      .addCase(fetchFilteredAppointments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFilteredAppointments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.appointments = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFilteredAppointments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
