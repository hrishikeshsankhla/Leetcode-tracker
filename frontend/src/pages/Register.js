import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Link,
  CircularProgress,
  Grid,
} from '@mui/material';
import { register, clearError } from '../store/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password1: '',
      password2: '',
      leetcode_username: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password1: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Required'),
      password2: Yup.string()
        .oneOf([Yup.ref('password1'), null], 'Passwords must match')
        .required('Required'),
      leetcode_username: Yup.string(),
    }),
    onSubmit: (values) => {
      dispatch(register(values));
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create an Account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
              onClose={() => dispatch(clearError())}
            >
              {typeof error === 'object' 
                ? Object.entries(error).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key === 'email' && value.includes('exists') ? 'Email already registered' : key}:</strong> {
                        Array.isArray(value) ? value.join(', ') : value
                      }
                    </div>
                  ))
                : error}
              {error && typeof error === 'object' && error.email && error.email.includes('exists') && (
                <Box sx={{ mt: 1 }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    <strong>Already have an account? Sign In</strong>
                  </Link>
                </Box>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password1"
                  label="Password"
                  type="password"
                  id="password1"
                  autoComplete="new-password"
                  value={formik.values.password1}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password1 && Boolean(formik.errors.password1)}
                  helperText={formik.touched.password1 && formik.errors.password1}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  value={formik.values.password2}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password2 && Boolean(formik.errors.password2)}
                  helperText={formik.touched.password2 && formik.errors.password2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="leetcode_username"
                  label="LeetCode Username (Optional)"
                  name="leetcode_username"
                  value={formik.values.leetcode_username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.leetcode_username && Boolean(formik.errors.leetcode_username)}
                  helperText={formik.touched.leetcode_username && formik.errors.leetcode_username}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;