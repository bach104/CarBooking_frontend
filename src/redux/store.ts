import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import driverReducer from './Driver/Driver.Slice';
import vehicleReducer from './Vehicle/Vehicle.Slice';
import vehicleTypeReducer from './VehicleType/VehicleType.Slice';
import staffReducer from './Staff/Staff.Slice';
import driverManagementReducer from './DriverManagement/DriverManagement.Slice';

export const store = configureStore({
  reducer: {
    driver: driverReducer,
    vehicle: vehicleReducer,
    vehicleType: vehicleTypeReducer,
    staff: staffReducer,
    driverManagement: driverManagementReducer,
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

// Helper function to get auth token from anywhere
export const getAuthToken = (): string | null => {
  const state = store.getState();
  if (state.staff?.token) return state.staff.token;
  return localStorage.getItem('staffToken');
};

// Helper function to get staff info from anywhere
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