import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar
} from 'recharts';
import { fetchUserStats } from '../store/slices/statsSlice';

const Analytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.stats);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Placeholder data - replace with actual data from stats when available
  const difficultyData = [
    { name: 'Easy', value: stats?.easy_solved || 0, color: '#00C49F' },
    { name: 'Medium', value: stats?.medium_solved || 0, color: '#FFBB28' },
    { name: 'Hard', value: stats?.hard_solved || 0, color: '#FF8042' },
  ];
  
  const submissionData = [
    { name: 'Accepted', value: stats?.accepted_submissions || 0, color: '#00C49F' },
    { name: 'Wrong Answer', value: stats?.wrong_answer_submissions || 0, color: '#FF8042' },
    { name: 'Time Limit Exceeded', value: stats?.tle_submissions || 0, color: '#FFBB28' },
    { name: 'Runtime Error', value: stats?.runtime_error_submissions || 0, color: '#0088FE' },
  ];
  
  // Monthly activity data - replace with actual data
  const monthlyActivity = stats?.monthly_activity || [
    { month: 'Jan', problems: 0 },
    { month: 'Feb', problems: 0 },
    { month: 'Mar', problems: 0 },
    { month: 'Apr', problems: 0 },
    { month: 'May', problems: 0 },
    { month: 'Jun', problems: 0 },
    { month: 'Jul', problems: 0 },
    { month: 'Aug', problems: 0 },
    { month: 'Sep', problems: 0 },
    { month: 'Oct', problems: 0 },
    { month: 'Nov', problems: 0 },
    { month: 'Dec', problems: 0 },
  ];
  
  // Language distribution data - replace with actual data
  const languageData = stats?.language_distribution || [
    { name: 'Python', count: 0 },
    { name: 'JavaScript', count: 0 },
    { name: 'Java', count: 0 },
    { name: 'C++', count: 0 },
    { name: 'Other', count: 0 },
  ];
  
  // Statistic cards data
  const statCards = [
    {
      title: 'Total Problems Solved',
      value: stats?.total_solved || 0,
      total: stats?.total_problems || 0,
      color: '#0088FE',
    },
    {
      title: 'Acceptance Rate',
      value: stats?.acceptance_rate?.toFixed(1) || 0,
      unit: '%',
      color: '#00C49F',
    },
    {
      title: 'Current Streak',
      value: stats?.current_streak || 0,
      unit: 'days',
      color: '#FFBB28',
    },
    {
      title: 'Longest Streak',
      value: stats?.longest_streak || 0,
      unit: 'days',
      color: '#FF8042',
    },
  ];
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  const renderStatCard = (card, index) => (
    <Card key={index} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {card.title}
        </Typography>
        <Typography 
          variant="h3" 
          color="primary" 
          sx={{ 
            display: 'flex', 
            alignItems: 'baseline',
            color: card.color 
          }}
        >
          {card.value}
          {card.unit && (
            <Typography variant="subtitle1" component="span" sx={{ ml: 0.5 }}>
              {card.unit}
            </Typography>
          )}
        </Typography>
        {card.total > 0 && (
          <Typography variant="body2" color="text.secondary">
            out of {card.total} total problems
          </Typography>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Progress
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            {renderStatCard(card, index)}
          </Grid>
        ))}
      </Grid>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Monthly Activity
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlyActivity}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="problems" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Problems Solved"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Problems by Difficulty
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} problems`, 'Solved']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Submission Results
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} submissions`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Languages Used
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={languageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Problems Solved" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;