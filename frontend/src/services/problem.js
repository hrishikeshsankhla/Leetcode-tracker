import api from './api';

export const getProblems = async (params) => {
  return api.get('/problems/', { params });
};

export const getProblem = async (id) => {
  return api.get(`/problems/${id}/`);
};

export const getDailyChallenges = async (params) => {
  return api.get('/daily-challenges/', { params });
};

export const getTodayChallenge = async () => {
  const today = new Date().toISOString().split('T')[0];
  return api.get(`/daily-challenges/?date=${today}`);
};