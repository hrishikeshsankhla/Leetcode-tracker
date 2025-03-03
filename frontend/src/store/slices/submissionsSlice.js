import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import submissionsService from '../../services/submissions';

const initialState = {
  submissions: [],
  submission: null,
  loading: false,
  success: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

// Fetch all submissions for the current user with optional filters
export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await submissionsService.getSubmissions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch submissions');
    }
  }
);

// Fetch a single submission by ID
export const fetchSubmission = createAsyncThunk(
  'submissions/fetchSubmission',
  async (id, { rejectWithValue }) => {
    try {
      const response = await submissionsService.getSubmission(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch submission');
    }
  }
);

// Create a new submission
export const createSubmission = createAsyncThunk(
  'submissions/createSubmission',
  async (submissionData, { rejectWithValue }) => {
    try {
      const response = await submissionsService.createSubmission(submissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create submission');
    }
  }
);

// Fetch submissions for a specific problem
export const fetchProblemSubmissions = createAsyncThunk(
  'submissions/fetchProblemSubmissions',
  async (problemId, { rejectWithValue }) => {
    try {
      const response = await submissionsService.getProblemSubmissions(problemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch problem submissions');
    }
  }
);

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearSubmission: (state) => {
      state.submission = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSubmissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchSubmission
      .addCase(fetchSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.submission = action.payload;
      })
      .addCase(fetchSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createSubmission
      .addCase(createSubmission.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.submission = action.payload;
        state.submissions = [action.payload, ...state.submissions];
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchProblemSubmissions
      .addCase(fetchProblemSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblemSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchProblemSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubmission, clearError, clearSuccess } = submissionsSlice.actions;
export default submissionsSlice.reducer;