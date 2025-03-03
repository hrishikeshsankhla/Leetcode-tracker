import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
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
} from '@mui/material';
import { fetchProblem, clearProblem } from '../store/slices/problemsSlice';
import { createSubmission, clearSuccess, clearError } from '../store/slices/submissionsSlice';

// Simple tab panel component
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

const ProblemDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { problem, loading: problemLoading } = useSelector((state) => state.problems);
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
    if (id) {
      dispatch(fetchProblem(id));
    }
    
    return () => {
      dispatch(clearProblem());
    };
  }, [dispatch, id]);
  
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
    const submissionData = {
      problem: id,
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
  
  if (!problem) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Problem not found.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/problems')}
        >
          Back to Problems
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {problem.problem_number}. {problem.title}
        </Typography>
        <Chip 
          label={problem.difficulty} 
          color={
            problem.difficulty === 'Easy' ? 'success' : 
            problem.difficulty === 'Medium' ? 'warning' : 'error'
          }
        />
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Description" />
            <Tab label="Submissions" />
            <Tab label="Discussion" />
            <Tab label="Solutions" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">
            {problem.description}
          </Typography>
          
          {problem.examples && problem.examples.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Examples:</Typography>
              {problem.examples.map((example, index) => (
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
          
          {problem.constraints && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Constraints:</Typography>
              <ul>
                {problem.constraints.map((constraint, index) => (
                  <li key={index}>
                    <Typography variant="body2">{constraint}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
          
          {problem.tags && problem.tags.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Tags:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {problem.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" size="small" />
                ))}
              </Box>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Your previous submissions will appear here.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">
            Community discussions about this problem will appear here.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1">
            Community solutions and approaches will appear here.
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

export default ProblemDetail;