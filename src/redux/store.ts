import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// import bookingReducer from './Booking/Booking.Slice';
// import customerReducer from './Customer/Customer.Slice';
import driverReducer from './Driver/Driver.Slice';
// import vehicleReducer from './Vehicle/Vehicle.Slice';
// import vehicleTypeReducer from './VehicleType/VehicleType.Slice';
// import tripAssignmentReducer from './TripAssignment/TripAssignment.Slice';
// import dashboardStatsReducer from './DashboardStats/DashboardStats.Slice';
// import revenueDataReducer from './RevenueData/RevenueData.Slice';
// import occupancyDataReducer from './OccupancyData/OccupancyData.Slice';
import staffReducer from './Staff/Staff.Slice';
import driverManagementReducer from './DriverManagement/DriverManagement.Slice';
// import apiResponseReducer from './ApiResponse/ApiResponse.Slice';

export const store = configureStore({
  reducer: {
    // booking: bookingReducer,
    // customer: customerReducer,
    driver: driverReducer,
    // vehicle: vehicleReducer,
    // vehicleType: vehicleTypeReducer,
    // tripAssignment: tripAssignmentReducer,
    // dashboardStats: dashboardStatsReducer,
    // revenueData: revenueDataReducer,
    // occupancyData: occupancyDataReducer,
    driverManagement: driverManagementReducer,
    staff: staffReducer,
    // apiResponse: apiResponseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;