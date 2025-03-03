import api from './api';

const PROBLEMS_URL = '/api/problems';

// Get a list of problems with optional filtering parameters
export const getProblems = async (params = {}) => {
  const response = await api.get(PROBLEMS_URL, { params });
  return response;
};

// Get a single problem by ID
export const getProblem = async (id) => {
  const response = await api.get(`${PROBLEMS_URL}/${id}/`);
  return response;
};

// Get today's challenge
export const getTodayChallenge = async () => {
  const response = await api.get(`${PROBLEMS_URL}/today-challenge/`);
  return response;
};

// Get problems by difficulty
export const getProblemsByDifficulty = async (difficulty) => {
  const response = await api.get(PROBLEMS_URL, { 
    params: { difficulty } 
  });
  return response;
};

// Get problems by tag
export const getProblemsByTag = async (tag) => {
  const response = await api.get(PROBLEMS_URL, { 
    params: { tag } 
  });
  return response;
};

const problemsService = {
  getProblems,
  getProblem,
  getTodayChallenge,
  getProblemsByDifficulty,
  getProblemsByTag,
};

export default problemsService;
