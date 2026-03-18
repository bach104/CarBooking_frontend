import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { revenueDataApi } from './RevenueData.Api';
import { RevenueData, MonthlyRevenue, RevenueByVehicleType } from '../../types/RevenueData.types';

interface RevenueDataState {
  lastDaysRevenue: RevenueData[];
  yearlyRevenue: MonthlyRevenue[];
  revenueByVehicleType: RevenueByVehicleType[];
  currentMonthRevenue: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: RevenueDataState = {
  lastDaysRevenue: [],
  yearlyRevenue: [],
  revenueByVehicleType: [],
  currentMonthRevenue: null,
  loading: false,
  error: null,
};

export const fetchRevenueLastDays = createAsyncThunk(
  'revenueData/fetchLastDays',
  async ({ token, days }: { token: string; days?: number }, { rejectWithValue }) => {
    try {
      return await revenueDataApi.getRevenueLastDays(token, days);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueByYear = createAsyncThunk(
  'revenueData/fetchByYear',
  async ({ token, year }: { token: string; year: number }, { rejectWithValue }) => {
    try {
      return await revenueDataApi.getRevenueByYear(token, year);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueByMonth = createAsyncThunk(
  'revenueData/fetchByMonth',
  async ({ token, year, month }: { token: string; year: number; month: number }, { rejectWithValue }) => {
    try {
      return await revenueDataApi.getRevenueByMonth(token, year, month);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRevenueByVehicleType = createAsyncThunk(
  'revenueData/fetchByVehicleType',
  async (token: string, { rejectWithValue }) => {
    try {
      return await revenueDataApi.getRevenueByVehicleType(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const revenueDataSlice = createSlice({
  name: 'revenueData',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch last days revenue
      .addCase(fetchRevenueLastDays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueLastDays.fulfilled, (state, action) => {
        state.loading = false;
        state.lastDaysRevenue = action.payload;
      })
      .addCase(fetchRevenueLastDays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch yearly revenue
      .addCase(fetchRevenueByYear.fulfilled, (state, action) => {
        state.yearlyRevenue = action.payload;
      })
      // Fetch monthly revenue
      .addCase(fetchRevenueByMonth.fulfilled, (state, action) => {
        state.currentMonthRevenue = action.payload;
      })
      // Fetch revenue by vehicle type
      .addCase(fetchRevenueByVehicleType.fulfilled, (state, action) => {
        state.revenueByVehicleType = action.payload;
      });
  },
});

export const { clearError } = revenueDataSlice.actions;
export default revenueDataSlice.reducer;