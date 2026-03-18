import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleTypeApi } from './VehicleType.Api';
import { VehicleType, PriceCalculation } from '../../types/VehicleType.types';

interface VehicleTypeState {
  vehicleTypes: VehicleType[];
  currentVehicleType: VehicleType | null;
  priceCalculation: PriceCalculation | null;
  loading: boolean;
  error: string | null;
}

const initialState: VehicleTypeState = {
  vehicleTypes: [],
  currentVehicleType: null,
  priceCalculation: null,
  loading: false,
  error: null,
};

export const fetchAllVehicleTypes = createAsyncThunk(
  'vehicleType/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await vehicleTypeApi.getAllVehicleTypes();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleTypeById = createAsyncThunk(
  'vehicleType/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await vehicleTypeApi.getVehicleTypeById(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculatePrice = createAsyncThunk(
  'vehicleType/calculatePrice',
  async ({ vehicleTypeId, distance }: { vehicleTypeId: string; distance: number }, { rejectWithValue }) => {
    try {
      return await vehicleTypeApi.calculatePrice(vehicleTypeId, distance);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVehicleType = createAsyncThunk(
  'vehicleType/create',
  async ({ vehicleType, token }: { vehicleType: Partial<VehicleType>; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleTypeApi.createVehicleType(vehicleType, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVehicleType = createAsyncThunk(
  'vehicleType/update',
  async ({ id, vehicleType, token }: { id: string; vehicleType: Partial<VehicleType>; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleTypeApi.updateVehicleType(id, vehicleType, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVehicleType = createAsyncThunk(
  'vehicleType/delete',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      await vehicleTypeApi.deleteVehicleType(id, token);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const vehicleTypeSlice = createSlice({
  name: 'vehicleType',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVehicleType: (state) => {
      state.currentVehicleType = null;
    },
    clearPriceCalculation: (state) => {
      state.priceCalculation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicle types
      .addCase(fetchAllVehicleTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleTypes = action.payload;
      })
      .addCase(fetchAllVehicleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch vehicle type by ID
      .addCase(fetchVehicleTypeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicleTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicleType = action.payload;
      })
      .addCase(fetchVehicleTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Calculate price
      .addCase(calculatePrice.pending, (state) => {
        state.loading = true;
      })
      .addCase(calculatePrice.fulfilled, (state, action) => {
        state.loading = false;
        state.priceCalculation = action.payload;
      })
      .addCase(calculatePrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create vehicle type
      .addCase(createVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes.unshift(action.payload);
      })
      // Update vehicle type
      .addCase(updateVehicleType.fulfilled, (state, action) => {
        const index = state.vehicleTypes.findIndex(vt => vt._id === action.payload._id);
        if (index !== -1) {
          state.vehicleTypes[index] = action.payload;
        }
        if (state.currentVehicleType?._id === action.payload._id) {
          state.currentVehicleType = action.payload;
        }
      })
      // Delete vehicle type
      .addCase(deleteVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes = state.vehicleTypes.filter(vt => vt._id !== action.payload);
        if (state.currentVehicleType?._id === action.payload) {
          state.currentVehicleType = null;
        }
      });
  },
});

export const { clearError, clearCurrentVehicleType, clearPriceCalculation } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;