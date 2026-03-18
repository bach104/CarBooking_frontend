import { getApiUrl } from '../../utils/dbUrl';
import { TripAssignment, AssignDriverPayload } from '../../types/TripAssignment.types';

export const tripAssignmentApi = {
  assignDriver: async (payload: AssignDriverPayload, token: string): Promise<TripAssignment> => {
    const response = await fetch(getApiUrl('/trip-assignments/assign'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to assign driver');
    }
    const data = await response.json();
    return data.data;
  },

  getAllAssignments: async (token: string): Promise<TripAssignment[]> => {
    const response = await fetch(getApiUrl('/trip-assignments'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    const data = await response.json();
    return data.data;
  },

  getAssignmentById: async (id: string, token: string): Promise<TripAssignment> => {
    const response = await fetch(getApiUrl(`/trip-assignments/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch assignment');
    }
    const data = await response.json();
    return data.data;
  },

  getAssignmentsByDriver: async (driverId: string, token: string): Promise<TripAssignment[]> => {
    const response = await fetch(getApiUrl(`/trip-assignments/driver/${driverId}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch driver assignments');
    }
    const data = await response.json();
    return data.data;
  },

  getAssignmentsByVehicleAndDate: async (vehicleId: string, date: string, token: string): Promise<TripAssignment[]> => {
    const response = await fetch(getApiUrl(`/trip-assignments/vehicle/${vehicleId}/date/${date}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle assignments');
    }
    const data = await response.json();
    return data.data;
  },

  updateAssignment: async (id: string, updates: Partial<TripAssignment>, token: string): Promise<TripAssignment> => {
    const response = await fetch(getApiUrl(`/trip-assignments/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }
    const data = await response.json();
    return data.data;
  },
};