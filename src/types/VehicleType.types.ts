// types/VehicleType.types.ts

export interface VehicleType {
  _id: string;
  type_name: string;
  seats: number;
  base_price: number;
  price_per_km: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface VehicleTypeFormData {
  type_name: string;
  seats: number;
  base_price: number;
  price_per_km: number;
  description?: string;
  image_url?: string;
}

export interface VehicleTypeUpdatePayload {
  type_name?: string;
  seats?: number;
  base_price?: number;
  price_per_km?: number;
  description?: string;
  image_url?: string;
}

export interface VehicleTypeStats {
  total: number;
  by_seats: Array<{
    _id: number;
    count: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export const DEFAULT_VEHICLE_TYPES: Omit<VehicleTypeFormData, 'image_url'>[] = [
  { type_name: 'Xe 4 chỗ', seats: 4, base_price: 50000, price_per_km: 12000, description: 'Xe du lịch 4 chỗ phù hợp cho gia đình nhỏ' },
  { type_name: 'Xe 7 chỗ', seats: 7, base_price: 70000, price_per_km: 15000, description: 'Xe gia đình 7 chỗ thoải mái' },
  { type_name: 'Xe 9 chỗ', seats: 9, base_price: 90000, price_per_km: 18000, description: 'Xe 9 chỗ phù hợp cho nhóm bạn' },
  { type_name: 'Xe 16 chỗ', seats: 16, base_price: 150000, price_per_km: 22000, description: 'Xe 16 chỗ phù hợp cho tour du lịch nhóm' },
  { type_name: 'Xe 29 chỗ', seats: 29, base_price: 250000, price_per_km: 28000, description: 'Xe khách 29 chỗ' },
  { type_name: 'Xe 45 chỗ', seats: 45, base_price: 350000, price_per_km: 35000, description: 'Xe khách lớn 45 chỗ' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};