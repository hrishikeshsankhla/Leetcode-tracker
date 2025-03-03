import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import statsService from '../../services/stats';

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

// Fetch user statistics
export const fetchUserStats = createAsyncThunk(
  'stats/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await statsService.getUserStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user statistics');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = statsSlice.actions;
export default statsSlice.reducer;