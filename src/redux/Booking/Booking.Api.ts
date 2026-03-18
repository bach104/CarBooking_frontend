import { apiGet, apiPost, apiPut } from '../../utils/api';
import { Booking, CreateBookingPayload } from '../../types/Booking.types';

export const bookingApi = {
  // Public endpoints (no auth)
  createBooking: async (payload: CreateBookingPayload): Promise<{ bookingId: string; booking: Booking }> => {
    return apiPost<{ bookingId: string; booking: Booking }>('/bookings', payload);
  },

  getBookingsByCustomerPhone: async (phone: string): Promise<Booking[]> => {
    return apiGet<Booking[]>(`/bookings/customer/${phone}`);
  },

  // Staff endpoints (need auth)
  getAllBookings: async (token: string): Promise<Booking[]> => {
    return apiGet<Booking[]>('/bookings');
  },

  getBookingById: async (id: string, token: string): Promise<Booking> => {
    return apiGet<Booking>(`/bookings/${id}`);
  },

  confirmBooking: async (id: string, token: string): Promise<Booking> => {
    return apiPut<Booking>(`/bookings/${id}/confirm`, {});
  },

  updateBookingStatus: async (
    id: string, 
    status: string, 
    token: string, 
    reason?: string
  ): Promise<Booking> => {
    return apiPut<Booking>(`/bookings/${id}/status`, { status, low_occupancy_reason: reason });
  },

  cancelBooking: async (id: string, token: string): Promise<Booking> => {
    return apiPut<Booking>(`/bookings/${id}/cancel`, {});
  },

  completeBooking: async (id: string, token: string): Promise<Booking> => {
    return apiPut<Booking>(`/bookings/${id}/complete`, {});
  },
};