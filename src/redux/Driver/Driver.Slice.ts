// src/redux/Driver/Driver.Slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverApi } from './Driver.Api';
import { 
  Driver, 
  DriverLoginResponse,
  DriverRegisterPayload,
  DriverLoginPayload 
} from '../../types/Driver.types';

interface DriverState {
  currentDriver: Driver | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

// Khôi phục state từ localStorage khi khởi tạo
const loadState = (): DriverState => {
  try {
    const token = localStorage.getItem('driverToken');
    const driverInfo = localStorage.getItem('driverInfo');
    
    return {
      currentDriver: driverInfo ? JSON.parse(driverInfo) : null,
      token: token || null,
      loading: false,
      error: null,
      success: false,
      message: null,
    };
  } catch (error) {
    console.error('Error loading driver state:', error);
    return {
      currentDriver: null,
      token: null,
      loading: false,
      error: null,
      success: false,
      message: null,
    };
  }
};

const initialState: DriverState = loadState();

// Đăng ký
export const driverRegister = createAsyncThunk(
  'driver/driver-register',
  async (payload: DriverRegisterPayload, { rejectWithValue }) => {
    try {
      const response = await driverApi.register(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

// Đăng nhập
export const driverLogin = createAsyncThunk(
  'driver/driver-login',
  async (payload: DriverLoginPayload, { rejectWithValue }) => {
    try {
      const response = await driverApi.login(payload);
      // Lưu token và driver info vào localStorage
      localStorage.setItem('driverToken', response.token);
      localStorage.setItem('driverInfo', JSON.stringify({
        _id: response.id,
        name: response.name,
        phone: response.phone,
        license_number: response.license_number,
        username: response.username,
        status: response.status,
        created_at: new Date().toISOString(),
      }));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

// Đăng xuất
export const driverLogout = createAsyncThunk(
  'driver/driver-logout',
  async (_, { rejectWithValue }) => {
    try {
      await driverApi.logout();
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      return null;
    } catch (error: any) {
      // Vẫn xóa localStorage dù API lỗi
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      return rejectWithValue(error.message || 'Đăng xuất thất bại');
    }
  }
);

// Lấy thông tin tài xế hiện tại
export const fetchCurrentDriver = createAsyncThunk(
  'driver/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverApi.getCurrentDriver();
      // Cập nhật localStorage
      localStorage.setItem('driverInfo', JSON.stringify(response));
      return response;
    } catch (error: any) {
      // Nếu lỗi, xóa localStorage
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
      return rejectWithValue(error.message || 'Lấy thông tin thất bại');
    }
  }
);

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    resetState: (state) => {
      state.currentDriver = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      localStorage.removeItem('driverToken');
      localStorage.removeItem('driverInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      // Đăng ký
      .addCase(driverRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(driverRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Đăng ký thành công';
      })
      .addCase(driverRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Đăng nhập
      .addCase(driverLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(driverLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = {
          _id: action.payload.id,
          name: action.payload.name,
          phone: action.payload.phone,
          license_number: action.payload.license_number,
          username: action.payload.username,
          status: action.payload.status as 'active' | 'inactive' | 'busy',
          created_at: new Date().toISOString(),
        };
        state.token = action.payload.token;
        state.success = true;
        state.message = 'Đăng nhập thành công';
      })
      .addCase(driverLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Đăng xuất
      .addCase(driverLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(driverLogout.fulfilled, (state) => {
        state.loading = false;
        state.currentDriver = null;
        state.token = null;
        state.success = true;
        state.message = 'Đăng xuất thành công';
      })
      .addCase(driverLogout.rejected, (state) => {
        state.loading = false;
        state.currentDriver = null;
        state.token = null;
      })

      // Lấy thông tin hiện tại
      .addCase(fetchCurrentDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.success = true;
      })
      .addCase(fetchCurrentDriver.rejected, (state) => {
        state.loading = false;
        state.currentDriver = null;
        state.token = null;
        state.error = 'Phiên đăng nhập hết hạn';
      });
  },
});

export const { clearError, clearMessage, resetState } = driverSlice.actions;
export default driverSlice.reducer;