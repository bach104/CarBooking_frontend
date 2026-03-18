import { getApiUrl } from '../../utils/dbUrl';
import { OccupancyData, VehicleOccupancyDetails } from '../../types/OccupancyData.types';

export const occupancyDataApi = {
  getOccupancyByDate: async (token: string, date: string): Promise<OccupancyData[]> => {
    const response = await fetch(getApiUrl(`/occupancy-data?date=${date}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch occupancy data');
    }
    const data = await response.json();
    return data.data;
  },

  getVehicleOccupancyDetails: async (token: string, vehicleId: string, date: string): Promise<VehicleOccupancyDetails> => {
    const response = await fetch(getApiUrl(`/occupancy-data/vehicle/${vehicleId}/${date}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle occupancy details');
    }
    const data = await response.json();
    return data.data;
  },
};