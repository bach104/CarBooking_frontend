import { getApiUrl } from '../../utils/dbUrl';
import { Driver, DriverLoginPayload, DriverRegisterPayload, DriverLoginResponse, DriverStats } from '../../types/Driver.types';

export const driverApi = {
  register: async (payload: DriverRegisterPayload) => {
    const response = await fetch(getApiUrl('/drivers/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    const data = await response.json();
    return data.data;
  },

  login: async (payload: DriverLoginPayload): Promise<DriverLoginResponse> => {
    const response = await fetch(getApiUrl('/drivers/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    const data = await response.json();
    return data.data;
  },

  // Staff routes
  getAllDrivers: async (token: string): Promise<Driver[]> => {
    const response = await fetch(getApiUrl('/drivers'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch drivers');
    }
    const data = await response.json();
    return data.data;
  },

  getDriverById: async (id: string, token: string): Promise<Driver> => {
    const response = await fetch(getApiUrl(`/drivers/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch driver');
    }
    const data = await response.json();
    return data.data;
  },

  updateDriverStatus: async (id: string, status: string, token: string): Promise<Driver> => {
    const response = await fetch(getApiUrl(`/drivers/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update driver status');
    }
    const data = await response.json();
    return data.data;
  },

  // Driver routes
  getDriverTrips: async (driverId: string, token: string): Promise<any[]> => {
    const response = await fetch(getApiUrl(`/drivers/${driverId}/trips`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch driver trips');
    }
    const data = await response.json();
    return data.data;
  },

  getDriverStats: async (driverId: string, token: string): Promise<DriverStats> => {
    const response = await fetch(getApiUrl(`/drivers/${driverId}/stats`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch driver stats');
    }
    const data = await response.json();
    return data.data;
  },

  confirmTrip: async (assignmentId: string, bookingId: string, token: string, reason?: string) => {
    const response = await fetch(getApiUrl('/drivers/confirm-trip'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ assignmentId, bookingId, reason }),
    });
    if (!response.ok) {
      throw new Error('Failed to confirm trip');
    }
    const data = await response.json();
    return data.data;
  },
};