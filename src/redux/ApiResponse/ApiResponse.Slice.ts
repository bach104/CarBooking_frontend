import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiResponseApi } from './ApiResponse.Api';
import { ApiResponse } from '../../types/ApiResponse.types';

interface ApiResponseState {
  health: {
    status: string;
    message: string;
    timestamp: string;
  } | null;
  seedStatus: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApiResponseState = {
  health: null,
  seedStatus: null,
  loading: false,
  error: null,
};

export const checkHealth = createAsyncThunk(
  'apiResponse/health',
  async () => {
    const response = await apiResponseApi.healthCheck();
    return response;
  }
);

export const seedDatabase = createAsyncThunk(
  'apiResponse/seed',
  async () => {
    const response = await apiResponseApi.seedData();
    return response;
  }
);

const apiResponseSlice = createSlice({
  name: 'apiResponse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Health check
      .addCase(checkHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.health = action.payload;
      })
      .addCase(checkHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Health check failed';
      })
      // Seed database
      .addCase(seedDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(seedDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.seedStatus = action.payload.message;
      })
      .addCase(seedDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Seed failed';
      });
  },
});

export const { clearError } = apiResponseSlice.actions;
export default apiResponseSlice.reducer;