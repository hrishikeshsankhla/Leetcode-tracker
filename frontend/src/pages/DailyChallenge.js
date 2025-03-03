import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { fetchTodayChallenge } from '../store/slices/problemsSlice';
import { createSubmission, clearSuccess, clearError } from '../store/slices/submissionsSlice';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`problem-tabpanel-${index}`}
      aria-labelledby={`problem-tab-${index}`}
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

const DailyChallenge = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { todayChallenge, loading: problemLoading } = useSelector((state) => state.problems);
  const { loading: submissionLoading, success, error } = useSelector((state) => state.submissions);
  
  const [tabValue, setTabValue] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
  ];

  useEffect(() => {
    dispatch(fetchTodayChallenge());
  }, [dispatch]);
  
  useEffect(() => {
    if (success) {
      setOpenSnackbar(true);
      setCode('');
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };
  
  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };
  
  const handleSubmit = () => {
    if (!todayChallenge) return;
    
    const submissionData = {
      problem: todayChallenge.id,
      language,
      code_content: code,
    };
    dispatch(createSubmission(submissionData));
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  if (problemLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!todayChallenge) {
    return (
      <Card sx={{ textAlign: 'center', my: 4, p: 3 }}>
        <CardContent>
          <CalendarTodayIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" color="text.primary" gutterBottom>
            No Challenge Available Today
          </Typography>
          <Typography variant="body1" color="text.secondary">
            There is no daily challenge available for today. Please check back tomorrow!
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/problems')}
          >
            Browse All Problems
          </Button>
        </CardActions>
      </Card>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Daily Challenge
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          {todayChallenge.problem_number}. {todayChallenge.title}
        </Typography>
        <Chip 
          label={todayChallenge.difficulty} 
          color={
            todayChallenge.difficulty === 'Easy' ? 'success' : 
            todayChallenge.difficulty === 'Medium' ? 'warning' : 'error'
          }
        />
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Description" />
            <Tab label="Submissions" />
            <Tab label="Discussion" />
            <Tab label="Hints" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">
            {todayChallenge.description}
          </Typography>
          
          {todayChallenge.examples && todayChallenge.examples.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Examples:</Typography>
              {todayChallenge.examples.map((example, index) => (
                <Paper key={index} sx={{ p: 2, my: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1">Example {index + 1}:</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Input:</strong> {example.input}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Output:</strong> {example.output}
                    </Typography>
                    {example.explanation && (
                      <Typography variant="body2">
                        <strong>Explanation:</strong> {example.explanation}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
          
          {todayChallenge.constraints && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Constraints:</Typography>
              <ul>
                {todayChallenge.constraints.map((constraint, index) => (
                  <li key={index}>
                    <Typography variant="body2">{constraint}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
          
          {todayChallenge.tags && todayChallenge.tags.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Tags:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {todayChallenge.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" size="small" />
                ))}
              </Box>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Your previous submissions for today's challenge will appear here.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">
            Community discussions about today's challenge will appear here.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1">
            {todayChallenge.hints && todayChallenge.hints.length > 0 ? (
              <Box>
                {todayChallenge.hints.map((hint, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Hint {index + 1}:</Typography>
                    <Typography variant="body2">{hint}</Typography>
                  </Alert>
                ))}
              </Box>
            ) : (
              "No hints available for this challenge."
            )}
          </Typography>
        </TabPanel>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Solution
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label="Language"
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          multiline
          rows={12}
          variant="outlined"
          placeholder={`Write your ${languages.find(l => l.value === language)?.label} solution here...`}
          value={code}
          onChange={handleCodeChange}
          sx={{ 
            mb: 2,
            fontFamily: 'monospace',
            '& .MuiInputBase-input': {
              fontFamily: 'monospace',
            },
          }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
            {typeof error === 'string' ? error : 'Failed to submit solution. Please try again.'}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!code.trim() || submissionLoading}
            onClick={handleSubmit}
          >
            {submissionLoading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          <Button
            variant="outlined"
            disabled={!code.trim() || submissionLoading}
          >
            Run Code
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Solution submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DailyChallenge;