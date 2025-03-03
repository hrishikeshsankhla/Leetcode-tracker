import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockResetIcon from '@mui/icons-material/LockReset';
import { updateUserProfile, fetchUserProfile, clearSuccess, clearError } from '../store/slices/authSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, success, error } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (success) {
      setOpenSnackbar(true);
      setEditMode(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Reset form if canceling edit
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          bio: user.bio || '',
        });
      }
    }
    setEditMode(!editMode);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setPasswordFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileUpdate = () => {
    dispatch(updateUserProfile(formData));
  };
  
  const handlePasswordUpdate = () => {
    if (validatePasswordForm()) {
      dispatch(updateUserProfile({ 
        current_password: passwordData.current_password,
        new_password: passwordData.new_password 
      }));
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{user?.username}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {user?.bio || "No bio provided"}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Member since:
              </Typography>
              <Typography variant="body2" gutterBottom>
                {user?.date_joined 
                  ? new Date(user.date_joined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
                }
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Email:
              </Typography>
              <Typography variant="body2">
                {user?.email || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Account Settings" />
                <Tab label="Password" />
                <Tab label="Preferences" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {!editMode ? (
                  <Button 
                    startIcon={<EditIcon />} 
                    onClick={handleEditToggle}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      color="error" 
                      startIcon={<CancelIcon />} 
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                    <Button 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={handleProfileUpdate}
                      disabled={loading}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                  {typeof error === 'object' 
                    ? Object.entries(error).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))
                    : error}
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode || loading}
                    placeholder="Tell us a little about yourself..."
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                      {typeof error === 'object' 
                        ? Object.entries(error).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))
                        : error}
                    </Alert>
                  )}
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        error={!!passwordFormErrors.current_password}
                        helperText={passwordFormErrors.current_password}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        error={!!passwordFormErrors.new_password}
                        helperText={passwordFormErrors.new_password}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        error={!!passwordFormErrors.confirm_password}
                        helperText={passwordFormErrors.confirm_password}
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LockResetIcon />}
                    sx={{ mt: 2 }}
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Password'}
                  </Button>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Application Preferences
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                User preference settings will be implemented in a future update.
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;