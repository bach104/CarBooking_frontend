import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '../../utils/dbUrl';
import { Vehicle } from '../../types/Vehicle.types';

export const vehicleApi = {
  getAllVehicles: async (token: string): Promise<Vehicle[]> => {
    const response = await fetch(getApiUrl('/vehicles'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    const data = await response.json();
    return data.data;
  },

  getVehicleById: async (id: string, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  getAvailableVehicles: async (token: string, date?: string, vehicleTypeId?: string, passengers?: number): Promise<Vehicle[]> => {
    let url = '/vehicles/available';
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (vehicleTypeId) params.append('vehicleTypeId', vehicleTypeId);
    if (passengers) params.append('passengers', passengers.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(getApiUrl(url), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch available vehicles');
    }
    const data = await response.json();
    return data.data;
  },

  createVehicle: async (vehicle: Partial<Vehicle>, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl('/vehicles'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Failed to create vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  updateVehicle: async (id: string, vehicle: Partial<Vehicle>, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Failed to update vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  updateVehicleStatus: async (id: string, status: string, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update vehicle status');
    }
    const data = await response.json();
    return data.data;
  },

  deleteVehicle: async (id: string, token: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete vehicle');
    }
  },
};

// Định nghĩa interface cho state
interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  availableVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  availableVehicles: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllVehicles = createAsyncThunk(
  'vehicle/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await vehicleApi.getAllVehicles(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicle/fetchById',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleApi.getVehicleById(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAvailableVehicles = createAsyncThunk(
  'vehicle/fetchAvailable',
  async ({ token, date, vehicleTypeId, passengers }: { token: string; date?: string; vehicleTypeId?: string; passengers?: number }, { rejectWithValue }) => {
    try {
      return await vehicleApi.getAvailableVehicles(token, date, vehicleTypeId, passengers);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicle/create',
  async ({ vehicle, token }: { vehicle: Partial<Vehicle>; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleApi.createVehicle(vehicle, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicle/update',
  async ({ id, vehicle, token }: { id: string; vehicle: Partial<Vehicle>; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleApi.updateVehicle(id, vehicle, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  'vehicle/updateStatus',
  async ({ id, status, token }: { id: string; status: string; token: string }, { rejectWithValue }) => {
    try {
      return await vehicleApi.updateVehicleStatus(id, status, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicle/delete',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      await vehicleApi.deleteVehicle(id, token);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    },
    clearAvailableVehicles: (state) => {
      state.availableVehicles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicles
      .addCase(fetchAllVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchAllVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch vehicle by ID
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch available vehicles
      .addCase(fetchAvailableVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.availableVehicles = action.payload;
      })
      .addCase(fetchAvailableVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.unshift(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        if (state.currentVehicle?._id === action.payload._id) {
          state.currentVehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update vehicle status
      .addCase(updateVehicleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicleStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        if (state.currentVehicle?._id === action.payload._id) {
          state.currentVehicle = action.payload;
        }
        const availIndex = state.availableVehicles.findIndex(v => v._id === action.payload._id);
        if (availIndex !== -1) {
          state.availableVehicles[availIndex] = action.payload;
        }
      })
      .addCase(updateVehicleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
        state.availableVehicles = state.availableVehicles.filter(v => v._id !== action.payload);
        if (state.currentVehicle?._id === action.payload) {
          state.currentVehicle = null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, clearCurrentVehicle, clearAvailableVehicles } = vehicleSlice.actions;

// Export reducer as default
export default vehicleSlice.reducer;