import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as superAdminService from "../../api/superAdminService";

const initialState = {
  usersList: [],
  totalElements: 0,
  totalPages: 0,
  currentUserProfile: null,
  auditLogs: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
  },
  imamsList: [],
  status: "idle",
  error: null,
};

export const fetchAllUsers = createAsyncThunk(
  "superAdmin/fetchAllUsers",
  async ({ page = 0, size = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await superAdminService.getUsers(page, size, search);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  "superAdmin/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await superAdminService.getUserDeepProfile(userId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const toggleUserLock = createAsyncThunk(
  "superAdmin/toggleUserLock",
  async (userId, { rejectWithValue }) => {
    try {
      await superAdminService.toggleUserLock(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  "superAdmin/fetchAuditLogs",
  async ({ page = 0, size = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await superAdminService.getAuditLogs(
        page,
        size,
        filters
      );
      return response.data.data; // Backend wraps in ApiResponse(true, msg, data)
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllImams = createAsyncThunk(
  "superAdmin/fetchAllImams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminService.getAllImams();
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createImam = createAsyncThunk(
  "superAdmin/createImam",
  async (imamData, { rejectWithValue, dispatch }) => {
    try {
      await superAdminService.createImam(imamData);
      dispatch(fetchAllImams());
      return;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateExistingImam = createAsyncThunk(
  "superAdmin/updateExistingImam",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await superAdminService.updateImam(id, data);
      dispatch(fetchAllImams());
      return;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const toggleImamActiveStatus = createAsyncThunk(
  "superAdmin/toggleImamStatus",
  async ({ id, isActive }, { rejectWithValue, dispatch }) => {
    try {
      await superAdminService.toggleImamStatus(id, isActive);
      dispatch(fetchAllImams());
      return;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentUserProfile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllUsers.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.usersList = action.payload.content;
      state.totalElements =
        action.payload.page?.totalElements || action.payload.totalElements || 0;
      state.totalPages =
        action.payload.page?.totalPages || action.payload.totalPages || 0;
    });
    builder.addCase(fetchAllUsers.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(fetchUserDetails.pending, (state) => {
      state.status = "loading";
      state.currentUserProfile = null;
      state.error = null;
    });
    builder.addCase(fetchUserDetails.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.currentUserProfile = action.payload;
    });

    builder.addCase(fetchUserDetails.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(toggleUserLock.fulfilled, (state, action) => {
      const userId = action.payload;

      const userInList = state.usersList.find((u) => u.id === userId);
      if (userInList) {
        userInList.isLocked = !userInList.isLocked;
      }

      if (state.currentUserProfile?.basicInfo?.id === userId) {
        state.currentUserProfile.basicInfo.isLocked =
          !state.currentUserProfile.basicInfo.isLocked;
      }
    });

    builder.addCase(fetchAuditLogs.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchAuditLogs.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.auditLogs = action.payload;
    });
    builder.addCase(fetchAuditLogs.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });

    builder.addCase(fetchAllImams.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchAllImams.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.imamsList = action.payload;
    });
    builder.addCase(fetchAllImams.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
  },
});

export const { clearCurrentProfile } = superAdminSlice.actions;
export default superAdminSlice.reducer;
