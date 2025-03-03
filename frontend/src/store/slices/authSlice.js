import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/auth';
import { jwtDecode } from 'jwt-decode';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Register the user
      await authService.register(userData);
      
      // On successful registration, log in with the new credentials
      try {
        const loginResponse = await authService.login({
          email: userData.email,
          password: userData.password1,
        });
        return loginResponse;
      } catch (loginError) {
        // If automatic login fails after registration (e.g. due to email verification requirement)
        console.log('Registration successful but automatic login failed:', loginError);
        return rejectWithValue({ 
          non_field_errors: ['Registration successful. Please check your email for verification instructions.'] 
        });
      }
    } catch (error) {
      // Check for specific error types and format them
      if (error.response && error.response.data) {
        // Database integrity error (like duplicate email) is sometimes in non-field errors
        if (error.response.data.non_field_errors) {
          const errorMsg = error.response.data.non_field_errors[0];
          if (errorMsg.includes('email') && errorMsg.includes('exists')) {
            return rejectWithValue({ email: ['This email address is already registered.'] });
          }
        }
        
        // Handle standard validation errors
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Registration failed. Please try again later.');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(accessToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUserProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateUserProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      return jwtDecode(token);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const initialState = {
  user: getUserFromToken(),
  loading: false,
  error: null,
  success: false,
  isAuthenticated: authService.isAuthenticated(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
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
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = jwtDecode(action.payload.access);
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = jwtDecode(action.payload.access);
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = jwtDecode(action.payload.access);
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      });
  },
});

export const { logout, clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;