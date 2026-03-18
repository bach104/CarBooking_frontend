import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import { VehicleType, PriceCalculation } from '../../types/VehicleType.types';

export const vehicleTypeApi = {
  getAllVehicleTypes: async (): Promise<VehicleType[]> => {
    return apiGet<VehicleType[]>('/vehicle-types');
  },

  getVehicleTypeById: async (id: string): Promise<VehicleType> => {
    return apiGet<VehicleType>(`/vehicle-types/${id}`);
  },

  calculatePrice: async (vehicleTypeId: string, distance: number): Promise<PriceCalculation> => {
    return apiGet<PriceCalculation>(
      `/vehicle-types/calculate-price?vehicleTypeId=${vehicleTypeId}&distance=${distance}`
    );
  },

  createVehicleType: async (vehicleType: Partial<VehicleType>, token: string): Promise<VehicleType> => {
    return apiPost<VehicleType>('/vehicle-types', vehicleType);
  },

  updateVehicleType: async (id: string, vehicleType: Partial<VehicleType>, token: string): Promise<VehicleType> => {
    return apiPut<VehicleType>(`/vehicle-types/${id}`, vehicleType);
  },

  deleteVehicleType: async (id: string, token: string): Promise<void> => {
    return apiDelete(`/vehicle-types/${id}`);
  },
};