import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ConfigItem {
  id: number;
  name: string;
}

interface ConfigurationManagerProps {
  title: string;
  items: ConfigItem[];
  loading?: boolean;
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  title,
  items,
  loading = false,
  onAdd,
  onDelete,
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConfigItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAddDialog = () => {
    setNewItemName('');
    setError(null);
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewItemName('');
    setError(null);
  };

  const handleAdd = async () => {
    if (!newItemName.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd(newItemName.trim());
      handleCloseAddDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (item: ConfigItem) => {
    setSelectedItem(item);
    setError(null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    setError(null);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    setError(null);
    try {
      await onDelete(selectedItem.id);
      handleCloseDeleteDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete item';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          disabled={loading}
        >
          Add New
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No items found. Add your first item!</Typography>
          </Box>
        ) : (
          <List>
            {items.map((item, index) => (
              <ListItem
                key={item.id}
                divider={index < items.length - 1}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleOpenDeleteDialog(item)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New {title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={submitting}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
