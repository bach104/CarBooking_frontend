import { getApiUrl } from '../../utils/dbUrl';
import {
  VehicleType,
  VehicleTypeFormData,
  VehicleTypeUpdatePayload,
  VehicleTypeStats,
  ApiResponse,
} from '../../types/VehicleType.types';

export const vehicleTypeApi = {
  addVehicleType: async (payload: VehicleTypeFormData, token?: string): Promise<VehicleType> => {
    const response = await fetch(getApiUrl('/vehicle-types'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data: ApiResponse<VehicleType> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Thêm loại xe thất bại');
    }

    return data.data as VehicleType;
  },

  // Lấy tất cả loại xe
  getAllVehicleTypes: async (token?: string): Promise<VehicleType[]> => {
    const response = await fetch(getApiUrl('/vehicle-types'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data: ApiResponse<VehicleType[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Lấy danh sách loại xe thất bại');
    }

    return data.data || [];
  },

  // Lấy loại xe theo ID
  getVehicleTypeById: async (id: string, token?: string): Promise<VehicleType> => {
    const response = await fetch(getApiUrl(`/vehicle-types/${id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data: ApiResponse<VehicleType> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Lấy thông tin loại xe thất bại');
    }

    return data.data as VehicleType;
  },

  // Lấy loại xe theo số chỗ
  getVehicleTypeBySeats: async (seats: number, token?: string): Promise<VehicleType | null> => {
    const response = await fetch(getApiUrl(`/vehicle-types/seats/${seats}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data: ApiResponse<VehicleType> = await response.json();

    if (!response.ok || !data.success) {
      return null;
    }

    return data.data as VehicleType;
  },

  // Cập nhật loại xe (cần quyền staff)
  updateVehicleType: async (id: string, payload: VehicleTypeUpdatePayload, token?: string): Promise<VehicleType> => {
    const response = await fetch(getApiUrl(`/vehicle-types/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<VehicleType> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Cập nhật loại xe thất bại');
    }

    return data.data as VehicleType;
  },

  // Xóa loại xe (cần quyền staff)
  deleteVehicleType: async (id: string, token?: string): Promise<{ id: string; type_name: string }> => {
    const response = await fetch(getApiUrl(`/vehicle-types/${id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data: ApiResponse<{ id: string; type_name: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Xóa loại xe thất bại');
    }

    return data.data as { id: string; type_name: string };
  },

  // Lấy thống kê loại xe
  getVehicleTypeStats: async (token?: string): Promise<VehicleTypeStats> => {
    const response = await fetch(getApiUrl('/vehicle-types/stats'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data: ApiResponse<VehicleTypeStats> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Lấy thống kê loại xe thất bại');
    }

    return data.data as VehicleTypeStats;
  },
};