import api from './api';

const SUBMISSIONS_URL = '/api/submissions';

// Get all submissions with optional filters
export const getSubmissions = async (params = {}) => {
  const response = await api.get(SUBMISSIONS_URL, { params });
  return response;
};

// Get a single submission by ID
export const getSubmission = async (id) => {
  const response = await api.get(`${SUBMISSIONS_URL}/${id}/`);
  return response;
};

// Create a new submission
export const createSubmission = async (submissionData) => {
  const response = await api.post(SUBMISSIONS_URL, submissionData);
  return response;
};

// Get submissions for a specific problem
export const getProblemSubmissions = async (problemId) => {
  const response = await api.get(SUBMISSIONS_URL, { 
    params: { problem: problemId } 
  });
  return response;
};

const submissionsService = {
  getSubmissions,
  getSubmission,
  createSubmission,
  getProblemSubmissions,
};

export default submissionsService;