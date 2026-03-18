import { getApiUrl } from '../../utils/dbUrl';
import { DashboardStats, StatusDistribution, Activity } from '../../types/DashboardStats.types';

export const dashboardStatsApi = {
  getDashboardStats: async (token: string): Promise<DashboardStats> => {
    const response = await fetch(getApiUrl('/dashboard-stats'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    const data = await response.json();
    return data.data;
  },

  getBookingStatusDistribution: async (token: string): Promise<StatusDistribution> => {
    const response = await fetch(getApiUrl('/dashboard-stats/distribution'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch status distribution');
    }
    const data = await response.json();
    return data.data;
  },

  getRecentActivities: async (token: string, limit?: number): Promise<Activity[]> => {
    let url = '/dashboard-stats/activities';
    if (limit) {
      url += `?limit=${limit}`;
    }
    const response = await fetch(getApiUrl(url), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    const data = await response.json();
    return data.data;
  },
};