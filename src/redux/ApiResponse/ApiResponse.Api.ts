import { getApiUrl } from '../../utils/dbUrl';

export const apiResponseApi = {
  healthCheck: async () => {
    const response = await fetch(getApiUrl('/health'));
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  },

  seedData: async () => {
    const response = await fetch(getApiUrl('/seed'), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Seed data failed');
    }
    return response.json();
  },
};