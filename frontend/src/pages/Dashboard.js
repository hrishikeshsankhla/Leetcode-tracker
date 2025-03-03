import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Typography, Card, CardContent, Paper, CircularProgress } from '@mui/material';
import { fetchTodayChallenge } from '../store/slices/problemsSlice';
import { fetchCurrentUser } from '../store/slices/authSlice';

const StatCard = ({ title, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color={color || 'primary'}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, loading: userLoading } = useSelector((state) => state.auth);
  const { todayChallenge, loading: problemLoading } = useSelector((state) => state.problems);
  
  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchTodayChallenge());
  }, [dispatch]);

  const loading = userLoading || problemLoading;

  // This would normally come from the user data or a dedicated stats endpoint
  const stats = {
    solved: user?.solved_count || 0,
    streak: user?.streak || 0,
    easy: user?.easy_solved || 0,
    medium: user?.medium_solved || 0,
    hard: user?.hard_solved || 0,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Box mt={4} mb={6}>
        <Typography variant="h5" gutterBottom>
          Your Progress
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Problems Solved" value={stats.solved} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Current Streak" value={stats.streak} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Completion Rate" value={`${Math.round((stats.solved / 2500) * 100)}%`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Easy" value={stats.easy} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Medium" value={stats.medium} color="warning.main" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Hard" value={stats.hard} color="error.main" />
          </Grid>
        </Grid>
      </Box>
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Today's Challenge
        </Typography>
        {todayChallenge ? (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" color="primary">
              {todayChallenge.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1, 
                  bgcolor: 
                    todayChallenge.difficulty === 'Easy' ? 'success.light' : 
                    todayChallenge.difficulty === 'Medium' ? 'warning.light' : 
                    'error.light',
                  color: 
                    todayChallenge.difficulty === 'Easy' ? 'success.dark' : 
                    todayChallenge.difficulty === 'Medium' ? 'warning.dark' : 
                    'error.dark',
                  mr: 1
                }}
              >
                {todayChallenge.difficulty}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {todayChallenge.tags?.join(', ')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {todayChallenge.description?.substring(0, 200)}...
            </Typography>
          </Paper>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No challenge available for today.
          </Typography>
        )}
      </Box>
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Your recent submissions will appear here.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;