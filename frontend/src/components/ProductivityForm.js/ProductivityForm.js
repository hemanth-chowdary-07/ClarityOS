import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Container,
  Snackbar,
  Alert,
  Fade,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ProductivityForm = () => {
  const initialFormData = {
    name: '',
    focus_hours: '',
    task_count: '',
    stress_level: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Sanitize name input
  const sanitizeName = (name) => {
    // Remove HTML tags, special characters, and limit to alphanumeric, spaces, and basic punctuation
    return name
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s.,'-]/g, '') // Only allow alphanumeric, spaces, and basic punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation with sanitization
    const sanitizedName = sanitizeName(formData.name);
    if (!sanitizedName) {
      newErrors.name = 'Name is required';
    } else if (sanitizedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (sanitizedName !== formData.name) {
      newErrors.name = 'Name contains invalid characters';
    }

    // Focus hours validation
    if (!formData.focus_hours) {
      newErrors.focus_hours = 'Focus hours is required';
    } else if (formData.focus_hours < 0 || formData.focus_hours > 12) {
      newErrors.focus_hours = 'Focus hours must be between 0 and 12';
    }

    // Task count validation
    if (!formData.task_count) {
      newErrors.task_count = 'Task count is required';
    } else if (!Number.isInteger(Number(formData.task_count)) || Number(formData.task_count) < 1 || Number(formData.task_count) > 50) {
      newErrors.task_count = 'Task count must be an integer between 1 and 50';
    }

    // Stress level validation
    if (!formData.stress_level) {
      newErrors.stress_level = 'Stress level is required';
    } else if (Number(formData.stress_level) < 1 || Number(formData.stress_level) > 5) {
      newErrors.stress_level = 'Stress level must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize name input on change
    const sanitizedValue = name === 'name' ? sanitizeName(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/productivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          task_count: Number(formData.task_count),
          focus_hours: Number(formData.focus_hours),
          stress_level: Number(formData.stress_level),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      // Reset form after successful submission
      setFormData(initialFormData);
      setSnackbar({
        open: true,
        message: 'Productivity data submitted successfully!',
        severity: 'success',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit form. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      {!showForm ? (
        <Fade in={!showForm}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            fullWidth
            size="large"
            sx={{ 
              py: 2,
              backgroundColor: 'background.paper',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              }
            }}
          >
            Add New Productivity Entry
          </Button>
        </Fade>
      ) : (
        <Fade in={showForm}>
          <StyledPaper elevation={2}>
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
              onClick={() => setShowForm(false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" component="h2" gutterBottom color="primary" sx={{ mb: 3 }}>
              Add Productivity Entry
            </Typography>
            <FormContainer component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Focus Hours"
                name="focus_hours"
                type="number"
                value={formData.focus_hours}
                onChange={handleChange}
                error={!!errors.focus_hours}
                helperText={errors.focus_hours}
                required
                disabled={loading}
                inputProps={{ min: 0, max: 12, step: 0.5 }}
              />
              <TextField
                fullWidth
                label="Task Count"
                name="task_count"
                type="number"
                value={formData.task_count}
                onChange={handleChange}
                error={!!errors.task_count}
                helperText={errors.task_count}
                required
                disabled={loading}
                inputProps={{ min: 1, max: 50 }}
              />
              <TextField
                fullWidth
                select
                label="Stress Level"
                name="stress_level"
                value={formData.stress_level}
                onChange={handleChange}
                error={!!errors.stress_level}
                helperText={errors.stress_level}
                required
                disabled={loading}
              >
                <MenuItem value={1}>Low (1)</MenuItem>
                <MenuItem value={2}>Moderate (2)</MenuItem>
                <MenuItem value={3}>High (3)</MenuItem>
                <MenuItem value={4}>Very High (4)</MenuItem>
                <MenuItem value={5}>Extreme (5)</MenuItem>
              </TextField>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>
            </FormContainer>
          </StyledPaper>
        </Fade>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductivityForm; 