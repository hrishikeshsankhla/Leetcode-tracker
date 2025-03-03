import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as problemsService from '../../services/problems';

export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async (params, { rejectWithValue }) => {
    try {
      const response = await problemsService.getProblems(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProblem = createAsyncThunk(
  'problems/fetchProblem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await problemsService.getProblem(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchTodayChallenge = createAsyncThunk(
  'problems/fetchTodayChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await problemsService.getTodayChallenge();
      return response.data.results[0] || null;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  problems: [],
  problem: null,
  todayChallenge: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
};

const problemsSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    clearProblem: (state) => {
      state.problem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload.results;
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch problems';
      })
      .addCase(fetchProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.problem = action.payload;
      })
      .addCase(fetchProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch problem';
      })
      .addCase(fetchTodayChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.todayChallenge = action.payload;
      })
      .addCase(fetchTodayChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch today challenge';
      });
  },
});

export const { clearProblem, clearError } = problemsSlice.actions;
export default problemsSlice.reducer;