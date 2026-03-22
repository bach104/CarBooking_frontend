import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import driverReducer from './Driver/Driver.Slice';
import vehicleReducer from './Vehicle/Vehicle.Slice';
import staffReducer from './Staff/Staff.Slice';
import driverManagementReducer from './DriverManagement/DriverManagement.Slice';
import bookingReducer from './Booking/Booking.Slice';
import staffBookingReducer from './StaffBooking/StaffBooking.Slice';
import staffCustomerReducer from './StaffCustomer/StaffCustomer.Slice';
import tripReducer from './Trip/Trip.Slice';
import driverTripReducer from './DriverTrip/DriverTrip.Slice'; 

export const store = configureStore({
  reducer: {
    driver: driverReducer,
    vehicle: vehicleReducer,
    staff: staffReducer,
    driverManagement: driverManagementReducer,
    booking: bookingReducer,
    staffBooking: staffBookingReducer,
    staffCustomer: staffCustomerReducer,
    trip: tripReducer,
    driverTrip: driverTripReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper lấy token cho từng role
export const getAuthToken = (): string | null => {
  const state = store.getState();
  // Staff token
  if (state.staff?.token) return state.staff.token;
  // Driver token
  if (state.driver?.token) return state.driver.token;
  // Fallback
  return localStorage.getItem('staffToken') || localStorage.getItem('driverToken');
};

export const getStaffInfo = (): any => {
  const state = store.getState();
  if (state.staff?.currentStaff) return state.staff.currentStaff;
  const stored = localStorage.getItem('staffInfo');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getDriverInfo = (): any => {
  const state = store.getState();
  if (state.driver?.currentDriver) return state.driver.currentDriver;
  const stored = localStorage.getItem('driverInfo');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};