import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    const roles = (decoded.roles || []).map((role) =>
      role.replace("ROLE_", "")
    );
    return {
      id: decoded.id,
      phoneNumber: decoded.sub,
      roles: roles,
    };
  } catch (error) {
    localStorage.removeItem("token");
    return null;
  }
};

const initialState = {
  token: localStorage.getItem("token") || null,
  user: getUserFromToken(localStorage.getItem("token")),
  status: "idle",
  error: null,
  otpMessage: "",
  usedChannel: null,
  lastOtpRequestTime: null,
};

export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/request-otp", {
        phoneNumber,
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 429) {
        return rejectWithValue({
          message:
            error.response?.data?.message ||
            "Rate limit exceeded. Please wait.",
          isRateLimitError: true,
        });
      }
      return rejectWithValue(
        error.response?.data || { message: "Failed to request OTP" }
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ phoneNumber, otp, channel }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/auth/verify-otp?channel=${channel}`,
        { phoneNumber, otp }
      );
      if (response.data?.data?.accessToken) {
        return response.data.data.accessToken;
      } else {
        return rejectWithValue({
          message: "Invalid response structure from server.",
        });
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "OTP verification failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.otpMessage = "";
      state.usedChannel = null;
      state.lastOtpRequestTime = null;
      state.status = "idle";
      localStorage.removeItem("token");
    },
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
      state.otpMessage = "";
      state.usedChannel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestOtp.pending, (state) => {
        state.status = "loading";
        state.otpMessage = "";
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.status = "otp_requested";
        state.otpMessage = action.payload.message;
        state.usedChannel = action.payload.usedChannel;
        state.lastOtpRequestTime = Date.now();
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        if (!action.payload?.isRateLimitError) {
          state.lastOtpRequestTime = null;
        }
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const token = action.payload;
        state.token = token;
        state.user = getUserFromToken(token);
        localStorage.setItem("token", token);
        state.status = "succeeded";
        state.otpMessage = "";
        state.usedChannel = null;
        state.lastOtpRequestTime = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, resetAuthStatus } = authSlice.actions;
export default authSlice.reducer;
