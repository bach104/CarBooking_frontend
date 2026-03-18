// src/redux/Customer/Customer.Slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from './Customer.Api';
import { Customer, CustomerWithBookings } from '../../types/Customer.types';

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  customerWithBookings: CustomerWithBookings | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  customerWithBookings: null,
  loading: false,
  error: null,
};

export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await customerApi.getAllCustomers(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customer/fetchById',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await customerApi.getCustomerById(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerByPhone = createAsyncThunk(
  'customer/fetchByPhone',
  async ({ phone, token }: { phone: string; token: string }, { rejectWithValue }) => {
    try {
      return await customerApi.getCustomerByPhone(phone, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerWithBookings = createAsyncThunk(
  'customer/fetchWithBookings',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await customerApi.getCustomerWithBookings(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/create',
  async ({ customer, token }: { customer: Partial<Customer>; token: string }, { rejectWithValue }) => {
    try {
      return await customerApi.createCustomer(customer, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customer/update',
  async ({ id, customer, token }: { id: string; customer: Partial<Customer>; token: string }, { rejectWithValue }) => {
    try {
      return await customerApi.updateCustomer(id, customer, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      await customerApi.deleteCustomer(id, token);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearCustomerWithBookings: (state) => {
      state.customerWithBookings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch customer with bookings
      .addCase(fetchCustomerWithBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerWithBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.customerWithBookings = action.payload;
      })
      .addCase(fetchCustomerWithBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer?._id === action.payload._id) {
          state.currentCustomer = action.payload;
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c._id !== action.payload);
        if (state.currentCustomer?._id === action.payload) {
          state.currentCustomer = null;
        }
      });
  },
});

export const { clearError, clearCurrentCustomer, clearCustomerWithBookings } = customerSlice.actions;
export default customerSlice.reducer;