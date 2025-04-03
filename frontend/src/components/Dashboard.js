import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
  CardActions,
  Button,
  Grid,
  Divider,
  TextField,
  MenuItem,
  Fade,
  Zoom,
  IconButton,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArchiveIcon from '@mui/icons-material/Archive';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoodIcon from '@mui/icons-material/Mood';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

function Dashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/productivity/summary');
      const result = await res.json();
      setSummary(result);
    } catch (err) {
      console.error('Summary fetch error:', err);
    }
  };

  const fetchData = async () => {
    try {
      let url = 'http://localhost:5002/api/productivity?status=active';
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate.toISOString().split('T')[0]}&endDate=${dateRange.endDate.toISOString().split('T')[0]}`;
      }
      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSummary();
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleArchive = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/productivity/${id}/archive`, {
        method: 'PATCH'
      });
      
      if (!response.ok) throw new Error('Failed to archive entry');
      
      setSnackbar({
        open: true,
        message: 'Entry archived successfully',
        severity: 'success'
      });
      
      fetchData();
      fetchSummary();
    } catch (error) {
      console.error('Archive error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to archive entry',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStressLevelColor = (level) => {
    const colors = {
      1: 'success',
      2: 'info',
      3: 'warning',
      4: 'error',
      5: 'error'
    };
    return colors[level] || 'default';
  };

  const getStressLevelLabel = (level) => {
    const labels = {
      1: 'Low',
      2: 'Moderate',
      3: 'High',
      4: 'Very High',
      5: 'Extreme'
    };
    return labels[level] || 'Unknown';
  };

  if (loading) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Loading productivity data...
      </Typography>
    </Box>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {/* Date Range Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>

        {data.length === 0 ? (
          <Fade in={true}>
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                '& .MuiAlert-icon': {
                  fontSize: '2rem'
                }
              }}
            >
              No productivity data available for the selected date range.
            </Alert>
          </Fade>
        ) : (
          <>
            {/* Summary Statistics */}
            {summary && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Zoom in={true}>
                    <StatsCard>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          30-Day Summary
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Total Entries
                            </Typography>
                            <Typography variant="h4">
                              {summary.totalEntries}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Average Performance
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Chip
                                  icon={<AssignmentTurnedInIcon />}
                                  label={`${Number(summary.avgTasks).toFixed(1)} tasks`}
                                  color="primary"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Chip
                                  icon={<AccessTimeIcon />}
                                  label={`${Number(summary.avgFocusHours).toFixed(1)} hrs`}
                                  color="secondary"
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Chip
                                  icon={<MoodIcon />}
                                  label={`Level ${Number(summary.avgStressLevel).toFixed(1)}`}
                                  color={getStressLevelColor(Math.round(summary.avgStressLevel))}
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </Stack>
                      </CardContent>
                    </StatsCard>
                  </Zoom>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                    <StatsCard>
                      <CardContent>
                        <Typography variant="h6" color="success.main" gutterBottom>
                          Highlights
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Most Productive Day
                            </Typography>
                            <Typography variant="h4">
                              {summary.maxTasks} Tasks
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(summary.maxTasks / 50) * 100}
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Best Stress Management
                            </Typography>
                            <Chip
                              icon={<MoodIcon />}
                              label={getStressLevelLabel(summary.minStress)}
                              color={getStressLevelColor(summary.minStress)}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </StatsCard>
                  </Zoom>
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 4 }} />
            
            {/* Individual Records */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Daily Records
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
              {data.map((entry, index) => (
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={entry.id}>
                  <StyledCard>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {entry.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {new Date(entry.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<AssignmentTurnedInIcon />}
                            label={`${entry.task_count} tasks`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={`${entry.focus_hours} hrs`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                        <Chip
                          icon={<MoodIcon />}
                          label={`Stress: ${getStressLevelLabel(entry.stress_level)}`}
                          color={getStressLevelColor(entry.stress_level)}
                          size="small"
                        />
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', mt: 'auto', p: 2 }}>
                      <Button
                        startIcon={<ArchiveIcon />}
                        color="secondary"
                        onClick={() => handleArchive(entry.id)}
                        size="small"
                      >
                        Archive
                      </Button>
                    </CardActions>
                  </StyledCard>
                </Zoom>
              ))}
            </Box>
          </>
        )}
      </LocalizationProvider>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;
