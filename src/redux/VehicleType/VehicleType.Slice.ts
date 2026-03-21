// slices/VehicleType/VehicleType.Slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vehicleTypeApi } from './VehicleType.Api';
import {
  VehicleType,
  VehicleTypeFormData,
  VehicleTypeUpdatePayload,
  VehicleTypeStats,
} from '../../types/VehicleType.types';

interface VehicleTypeState {
  vehicleTypes: VehicleType[];
  currentVehicleType: VehicleType | null;
  stats: VehicleTypeStats | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

const initialState: VehicleTypeState = {
  vehicleTypes: [],
  currentVehicleType: null,
  stats: null,
  loading: false,
  error: null,
  success: false,
  message: null,
};

// Async Thunks

// Thêm loại xe mới (cần quyền staff)
export const addVehicleType = createAsyncThunk(
  'vehicleType/add',
  async (payload: VehicleTypeFormData, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.addVehicleType(payload, staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Thêm loại xe thất bại');
    }
  }
);

// Lấy tất cả loại xe
export const fetchAllVehicleTypes = createAsyncThunk(
  'vehicleType/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.getAllVehicleTypes(staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lấy danh sách loại xe thất bại');
    }
  }
);

// Lấy loại xe theo ID
export const fetchVehicleTypeById = createAsyncThunk(
  'vehicleType/fetchById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.getVehicleTypeById(id, staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lấy thông tin loại xe thất bại');
    }
  }
);

// Lấy loại xe theo số chỗ
export const fetchVehicleTypeBySeats = createAsyncThunk(
  'vehicleType/fetchBySeats',
  async (seats: number, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.getVehicleTypeBySeats(seats, staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lấy loại xe theo số chỗ thất bại');
    }
  }
);

// Cập nhật loại xe (cần quyền staff)
export const updateVehicleType = createAsyncThunk(
  'vehicleType/update',
  async ({ id, payload }: { id: string; payload: VehicleTypeUpdatePayload }, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.updateVehicleType(id, payload, staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Cập nhật loại xe thất bại');
    }
  }
);

// Xóa loại xe (cần quyền staff)
export const deleteVehicleType = createAsyncThunk(
  'vehicleType/delete',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.deleteVehicleType(id, staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Xóa loại xe thất bại');
    }
  }
);

// Lấy thống kê loại xe
export const fetchVehicleTypeStats = createAsyncThunk(
  'vehicleType/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { staff } = getState() as { staff: { token: string | null } };
      const response = await vehicleTypeApi.getVehicleTypeStats(staff.token || undefined);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lấy thống kê loại xe thất bại');
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
    clearMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    setCurrentVehicleType: (state, action: PayloadAction<VehicleType | null>) => {
      state.currentVehicleType = action.payload;
    },
    resetState: (state) => {
      state.vehicleTypes = [];
      state.currentVehicleType = null;
      state.stats = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Vehicle Type
      .addCase(addVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addVehicleType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Thêm loại xe thành công';
        state.vehicleTypes.unshift(action.payload);
      })
      .addCase(addVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Fetch All Vehicle Types
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

      // Fetch Vehicle Type By ID
      .addCase(fetchVehicleTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicleType = action.payload;
      })
      .addCase(fetchVehicleTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Vehicle Type By Seats
      .addCase(fetchVehicleTypeBySeats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypeBySeats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentVehicleType = action.payload;
        }
      })
      .addCase(fetchVehicleTypeBySeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Vehicle Type
      .addCase(updateVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVehicleType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Cập nhật loại xe thành công';
        
        // Update in vehicleTypes list
        const index = state.vehicleTypes.findIndex(vt => vt._id === action.payload._id);
        if (index !== -1) {
          state.vehicleTypes[index] = action.payload;
        }
        
        // Update current vehicle type if it's the same
        if (state.currentVehicleType?._id === action.payload._id) {
          state.currentVehicleType = action.payload;
        }
      })
      .addCase(updateVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Delete Vehicle Type
      .addCase(deleteVehicleType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicleType.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Xóa loại xe thành công';
        
        // Remove from vehicleTypes list
        state.vehicleTypes = state.vehicleTypes.filter(vt => vt._id !== action.payload.id);
        
        // Clear current vehicle type if it's the deleted one
        if (state.currentVehicleType?._id === action.payload.id) {
          state.currentVehicleType = null;
        }
      })
      .addCase(deleteVehicleType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Vehicle Type Stats
      .addCase(fetchVehicleTypeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleTypeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchVehicleTypeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMessage, setCurrentVehicleType, resetState } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;