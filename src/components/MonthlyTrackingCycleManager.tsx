import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTrackingCycleContext } from '../contexts/TrackingCycleContext';
import { formatDateForDisplay } from '../utils/dateUtils';
import { CreateTrackingCycleDTO } from '../types';

export const MonthlyTrackingCycleManager: React.FC = () => {
  const {
    trackingCycles,
    loading,
    error,
    createTrackingCycle,
    deleteTrackingCycle,
  } = useTrackingCycleContext();

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    overlap?: string;
  }>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }

      // Check for overlapping cycles
      const hasOverlap = trackingCycles.some((cycle) => {
        const cycleStart = new Date(cycle.startDate);
        const cycleEnd = new Date(cycle.endDate);

        return (
          (start >= cycleStart && start <= cycleEnd) ||
          (end >= cycleStart && end <= cycleEnd) ||
          (start <= cycleStart && end >= cycleEnd)
        );
      });

      if (hasOverlap) {
        errors.overlap = 'Date range overlaps with an existing tracking cycle';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [field]: undefined, overlap: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const dto: CreateTrackingCycleDTO = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      await createTrackingCycle(dto);
      
      // Reset form
      setFormData({ name: '', startDate: '', endDate: '' });
      setFormErrors({});
      setSuccessMessage('Tracking cycle created successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is handled by context
      console.error('Failed to create tracking cycle:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setCycleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (cycleToDelete === null) return;

    try {
      await deleteTrackingCycle(cycleToDelete);
      setSuccessMessage('Tracking cycle deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete tracking cycle:', err);
    } finally {
      setDeleteDialogOpen(false);
      setCycleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCycleToDelete(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Tracking Cycle Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Create Form */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create New Tracking Cycle
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Cycle Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
                placeholder="e.g., January 2024"
              />

              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              {formErrors.overlap && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formErrors.overlap}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Tracking Cycle'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* List of Cycles */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tracking Cycles
            </Typography>

            {loading && trackingCycles.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : trackingCycles.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography color="text.secondary">
                  No tracking cycles yet. Create one to get started.
                </Typography>
              </Paper>
            ) : (
              <List>
                {trackingCycles
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .map((cycle) => (
                    <ListItem
                      key={cycle.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: cycle.isActive ? 'action.selected' : 'background.paper',
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteClick(cycle.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{cycle.name}</Typography>
                            {cycle.isActive && (
                              <Chip
                                label="Active"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {formatDateForDisplay(cycle.startDate)} -{' '}
                            {formatDateForDisplay(cycle.endDate)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tracking cycle? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
