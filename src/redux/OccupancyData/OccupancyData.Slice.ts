import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { occupancyDataApi } from './OccupancyData.Api';
import { OccupancyData, VehicleOccupancyDetails } from '../../types/OccupancyData.types';

interface OccupancyDataState {
  occupancyData: OccupancyData[];
  vehicleOccupancyDetails: VehicleOccupancyDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: OccupancyDataState = {
  occupancyData: [],
  vehicleOccupancyDetails: null,
  loading: false,
  error: null,
};

export const fetchOccupancyByDate = createAsyncThunk(
  'occupancyData/fetchByDate',
  async ({ token, date }: { token: string; date: string }, { rejectWithValue }) => {
    try {
      return await occupancyDataApi.getOccupancyByDate(token, date);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleOccupancyDetails = createAsyncThunk(
  'occupancyData/fetchVehicleDetails',
  async ({ token, vehicleId, date }: { token: string; vehicleId: string; date: string }, { rejectWithValue }) => {
    try {
      return await occupancyDataApi.getVehicleOccupancyDetails(token, vehicleId, date);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const occupancyDataSlice = createSlice({
  name: 'occupancyData',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVehicleOccupancyDetails: (state) => {
      state.vehicleOccupancyDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch occupancy by date
      .addCase(fetchOccupancyByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOccupancyByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.occupancyData = action.payload;
      })
      .addCase(fetchOccupancyByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch vehicle occupancy details
      .addCase(fetchVehicleOccupancyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleOccupancyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleOccupancyDetails = action.payload;
      })
      .addCase(fetchVehicleOccupancyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearVehicleOccupancyDetails } = occupancyDataSlice.actions;
export default occupancyDataSlice.reducer;