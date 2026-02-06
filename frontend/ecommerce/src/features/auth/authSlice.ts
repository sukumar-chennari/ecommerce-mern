import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { authApi } from "./authApi";

interface User {
  name: ReactNode;
  _id: string;
  email: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.getMe.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      }
    );
    builder.addMatcher(
      authApi.endpoints.getMe.matchRejected,
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      }
    );
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;