import { getApiUrl } from '../../utils/dbUrl';
import { RevenueData, MonthlyRevenue, RevenueByVehicleType } from '../../types/RevenueData.types';

export const revenueDataApi = {
  getRevenueLastDays: async (token: string, days: number = 7): Promise<RevenueData[]> => {
    const response = await fetch(getApiUrl(`/revenue-data/last-days?days=${days}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch revenue data');
    }
    const data = await response.json();
    return data.data;
  },

  getRevenueByYear: async (token: string, year: number): Promise<MonthlyRevenue[]> => {
    const response = await fetch(getApiUrl(`/revenue-data/year/${year}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch yearly revenue');
    }
    const data = await response.json();
    return data.data;
  },

  getRevenueByMonth: async (token: string, year: number, month: number): Promise<number> => {
    const response = await fetch(getApiUrl(`/revenue-data/year/${year}/month/${month}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch monthly revenue');
    }
    const data = await response.json();
    return data.data.revenue;
  },

  getRevenueByVehicleType: async (token: string): Promise<RevenueByVehicleType[]> => {
    const response = await fetch(getApiUrl('/revenue-data/by-vehicle-type'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch revenue by vehicle type');
    }
    const data = await response.json();
    return data.data;
  },
};