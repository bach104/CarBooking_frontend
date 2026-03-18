import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripAssignmentApi } from './TripAssignment.Api';
import { TripAssignment, AssignDriverPayload } from '../../types/TripAssignment.types';

interface TripAssignmentState {
  assignments: TripAssignment[];
  currentAssignment: TripAssignment | null;
  driverAssignments: TripAssignment[];
  vehicleAssignments: TripAssignment[];
  loading: boolean;
  error: string | null;
}

const initialState: TripAssignmentState = {
  assignments: [],
  currentAssignment: null,
  driverAssignments: [],
  vehicleAssignments: [],
  loading: false,
  error: null,
};

export const assignDriver = createAsyncThunk(
  'tripAssignment/assign',
  async ({ payload, token }: { payload: AssignDriverPayload; token: string }, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.assignDriver(payload, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllAssignments = createAsyncThunk(
  'tripAssignment/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.getAllAssignments(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'tripAssignment/fetchById',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.getAssignmentById(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssignmentsByDriver = createAsyncThunk(
  'tripAssignment/fetchByDriver',
  async ({ driverId, token }: { driverId: string; token: string }, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.getAssignmentsByDriver(driverId, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssignmentsByVehicleAndDate = createAsyncThunk(
  'tripAssignment/fetchByVehicleAndDate',
  async ({ vehicleId, date, token }: { vehicleId: string; date: string; token: string }, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.getAssignmentsByVehicleAndDate(vehicleId, date, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'tripAssignment/update',
  async ({ id, updates, token }: { id: string; updates: Partial<TripAssignment>; token: string }, { rejectWithValue }) => {
    try {
      return await tripAssignmentApi.updateAssignment(id, updates, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tripAssignmentSlice = createSlice({
  name: 'tripAssignment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearDriverAssignments: (state) => {
      state.driverAssignments = [];
    },
    clearVehicleAssignments: (state) => {
      state.vehicleAssignments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Assign driver
      .addCase(assignDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.unshift(action.payload);
      })
      .addCase(assignDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all assignments
      .addCase(fetchAllAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAllAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch assignment by ID
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.currentAssignment = action.payload;
      })
      // Fetch assignments by driver
      .addCase(fetchAssignmentsByDriver.fulfilled, (state, action) => {
        state.driverAssignments = action.payload;
      })
      // Fetch assignments by vehicle and date
      .addCase(fetchAssignmentsByVehicleAndDate.fulfilled, (state, action) => {
        state.vehicleAssignments = action.payload;
      })
      // Update assignment
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        if (state.currentAssignment?._id === action.payload._id) {
          state.currentAssignment = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentAssignment, clearDriverAssignments, clearVehicleAssignments } = tripAssignmentSlice.actions;
export default tripAssignmentSlice.reducer;