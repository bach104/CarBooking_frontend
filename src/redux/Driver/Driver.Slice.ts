// src/redux/Driver/Driver.Slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverApi } from './Driver.Api';
import { Driver, DriverLoginResponse, DriverStats } from '../..types/Driver.types';

interface DriverState {
  drivers: Driver[];
  currentDriver: Driver | null;
  driverStats: DriverStats | null;
  driverTrips: any[];
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DriverState = {
  drivers: [],
  currentDriver: null,
  driverStats: null,
  driverTrips: [],
  token: localStorage.getItem('driverToken'),
  loading: false,
  error: null,
};

export const driverRegister = createAsyncThunk(
  'driver/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      return await driverApi.register(payload);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const driverLogin = createAsyncThunk(
  'driver/login',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await driverApi.login(payload);
      localStorage.setItem('driverToken', response.token);
      localStorage.setItem('driverInfo', JSON.stringify(response.driver));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllDrivers = createAsyncThunk(
  'driver/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await driverApi.getAllDrivers(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDriverById = createAsyncThunk(
  'driver/fetchById',
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      return await driverApi.getDriverById(id, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDriverTrips = createAsyncThunk(
  'driver/fetchTrips',
  async ({ driverId, token }: { driverId: string; token: string }, { rejectWithValue }) => {
    try {
      return await driverApi.getDriverTrips(driverId, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDriverStats = createAsyncThunk(
  'driver/fetchStats',
  async ({ driverId, token }: { driverId: string; token: string }, { rejectWithValue }) => {
    try {
      return await driverApi.getDriverStats(driverId, token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmTrip = createAsyncThunk(
  'driver/confirmTrip',
  async ({ assignmentId, bookingId, token, reason }: { assignmentId: string; booking