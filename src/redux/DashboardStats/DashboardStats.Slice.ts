import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardStatsApi } from './DashboardStats.Api';
import { DashboardStats, StatusDistribution, Activity } from '../../types/DashboardStats.types';

interface DashboardStatsState {
  stats: DashboardStats | null;
  distribution: StatusDistribution | null;
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardStatsState = {
  stats: null,
  distribution: null,
  activities: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboardStats/fetch',
  async (token: string, { rejectWithValue }) => {
    try {
      return await dashboardStatsApi.getDashboardStats(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStatusDistribution = createAsyncThunk(
  'dashboardStats/fetchDistribution',
  async (token: string, { rejectWithValue }) => {
    try {
      return await dashboardStatsApi.getBookingStatusDistribution(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboardStats/fetchActivities',
  async ({ token, limit }: { token: string; limit?: number }, { rejectWithValue }) => {
    try {
      return await dashboardStatsApi.getRecentActivities(token, limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardStatsSlice = createSlice({
  name: 'dashboardStats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch status distribution
      .addCase(fetchStatusDistribution.fulfilled, (state, action) => {
        state.distribution = action.payload;
      })
      // Fetch recent activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.activities = action.payload;
      });
  },
});

export const { clearError } = dashboardStatsSlice.actions;
export default dashboardStatsSlice.reducer;