import api from './api';

const STATS_URL = '/api/stats';

// Get user statistics
export const getUserStats = async () => {
  const response = await api.get(`${STATS_URL}/user/`);
  return response;
};

const statsService = {
  getUserStats,
};

export default statsService;