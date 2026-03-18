// src/redux/Vehicle/Vehicle.Api.ts
import { getApiUrl } from '../../utils/dbUrl';
import { Vehicle } from '../../types/Vehicle.types';

export const vehicleApi = {
  getAllVehicles: async (token: string): Promise<Vehicle[]> => {
    const response = await fetch(getApiUrl('/vehicles'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    const data = await response.json();
    return data.data;
  },

  getVehicleById: async (id: string, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  getAvailableVehicles: async (token: string, date?: string, vehicleTypeId?: string, passengers?: number): Promise<Vehicle[]> => {
    let url = '/vehicles/available';
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (vehicleTypeId) params.append('vehicleTypeId', vehicleTypeId);
    if (passengers) params.append('passengers', passengers.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(getApiUrl(url), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch available vehicles');
    }
    const data = await response.json();
    return data.data;
  },

  createVehicle: async (vehicle: Partial<Vehicle>, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl('/vehicles'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Failed to create vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  updateVehicle: async (id: string, vehicle: Partial<Vehicle>, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) {
      throw new Error('Failed to update vehicle');
    }
    const data = await response.json();
    return data.data;
  },

  updateVehicleStatus: async (id: string, status: string, token: string): Promise<Vehicle> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update vehicle status');
    }
    const data = await response.json();
    return data.data;
  },

  deleteVehicle: async (id: string, token: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/vehicles/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete vehicle');
    }
  },
};