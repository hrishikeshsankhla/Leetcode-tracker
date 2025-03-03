import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchProblems } from '../store/slices/problemsSlice';

const ProblemList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { problems, loading, pagination } = useSelector((state) => state.problems);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  
  // Tags would typically come from an API endpoint
  const availableTags = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 
    'Math', 'Sorting', 'Greedy', 'Depth-First Search', 
    'Binary Search', 'Tree', 'Graph', 'Linked List'
  ];

  useEffect(() => {
    const params = {
      page: page + 1,
      page_size: rowsPerPage,
      ...(search && { search }),
      ...(difficulty && { difficulty }),
      ...(tag && { tag }),
    };
    
    dispatch(fetchProblems(params));
  }, [dispatch, page, rowsPerPage, search, difficulty, tag]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleProblemClick = (id) => {
    navigate(`/problems/${id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    setPage(0);
  };

  const handleTagChange = (event) => {
    setTag(event.target.value);
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Problems
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search problems..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-select-label"
                id="difficulty-select"
                value={difficulty}
                label="Difficulty"
                onChange={handleDifficultyChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="tag-select-label">Tag</InputLabel>
              <Select
                labelId="tag-select-label"
                id="tag-select"
                value={tag}
                label="Tag"
                onChange={handleTagChange}
              >
                <MenuItem value="">All</MenuItem>
                {availableTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="5%">#</TableCell>
                  <TableCell width="45%">Title</TableCell>
                  <TableCell width="15%" align="center">Difficulty</TableCell>
                  <TableCell width="20%">Tags</TableCell>
                  <TableCell width="15%" align="right">Acceptance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow 
                    key={problem.id} 
                    hover 
                    onClick={() => handleProblemClick(problem.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{problem.problem_number}</TableCell>
                    <TableCell>
                      <Typography color={problem.is_solved ? 'success.main' : 'inherit'}>
                        {problem.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={problem.difficulty} 
                        color={getDifficultyColor(problem.difficulty)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {problem.tags?.slice(0, 2).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                        {problem.tags?.length > 2 && (
                          <Chip label={`+${problem.tags.length - 2}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{problem.acceptance_rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={pagination.count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
};

export default ProblemList;