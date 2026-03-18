import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingApi } from './Booking.Api';
import { Booking, CreateBookingPayload } from '../../types/Booking.types';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  customerBookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  customerBookings: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await bookingApi.getAllBookings(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchById',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await bookingApi.getBookingById(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingsByPhone = createAsyncThunk(
  'booking/fetchByPhone',
  async (phone: string, { rejectWithValue }) => {
    try {
      return await bookingApi.getBookingsByCustomerPhone(phone);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      return await bookingApi.createBooking(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirm',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.confirmBooking(id, token);
      return { id, booking: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ 
    id, status, token, reason 
  }: { id: string; status: string; token: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.updateBookingStatus(id, status, token, reason);
      return { id, booking: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.cancelBooking(id, token);
      return { id, booking: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeBooking = createAsyncThunk(
  'booking/complete',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.completeBooking(id, token);
      return { id, booking: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearCustomerBookings: (state) => {
      state.customerBookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bookings
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch bookings by phone
      .addCase(fetchBookingsByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsByPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.customerBookings = action.payload;
      })
      .addCase(fetchBookingsByPhone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload.booking);
        state.currentBooking = action.payload.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Confirm booking
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], status: 'confirmed' };
        }
        if (state.currentBooking && state.currentBooking._id === action.payload.id) {
          state.currentBooking.status = 'confirmed';
        }
      })
      
      // Update status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }
        if (state.currentBooking && state.currentBooking._id === action.payload.id) {
          state.currentBooking = action.payload.booking;
        }
      })
      
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload.id);
        if (index !== -1) {
          state.bookings[index].status = 'cancelled';
        }
        if (state.currentBooking && state.currentBooking._id === action.payload.id) {
          state.currentBooking.status = 'cancelled';
        }
      })
      
      // Complete booking
      .addCase(completeBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload.id);
        if (index !== -1) {
          state.bookings[index].status = 'completed';
        }
        if (state.currentBooking && state.currentBooking._id === action.payload.id) {
          state.currentBooking.status = 'completed';
        }
      });
  },
});

export const { clearError, clearCurrentBooking, clearCustomerBookings } = bookingSlice.actions;
export default bookingSlice.reducer;