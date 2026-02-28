import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { TransactionType, Category, SubCategory } from '../types';

interface CategoryManagerProps {
  transactionTypes: TransactionType[];
  categories: Category[];
  subCategories: SubCategory[];
  loading?: boolean;
  onAddCategory: (name: string, transactionTypeId: number) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onAddSubCategory: (name: string, categoryId: number) => Promise<void>;
  onUpdateSubCategory: (id: number, name: string) => Promise<void>;
  onDeleteSubCategory: (id: number) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  transactionTypes,
  categories,
  subCategories,
  loading = false,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Category dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryTypeId, setCategoryTypeId] = useState<number | ''>('');
  
  // SubCategory dialogs
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryParentId, setSubCategoryParentId] = useState<number | ''>('');
  
  // Delete dialogs
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteSubCategoryDialogOpen, setDeleteSubCategoryDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | SubCategory | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set default transaction type when types are loaded
  useEffect(() => {
    if (transactionTypes.length > 0 && selectedTypeId === '') {
      setSelectedTypeId(transactionTypes[0].id);
    }
  }, [transactionTypes, selectedTypeId]);

  const filteredCategories = selectedTypeId
    ? categories.filter((cat) => cat.transactionTypeId === selectedTypeId)
    : categories;

  const getSubCategoriesForCategory = (categoryId: number) => {
    return subCategories.filter((sub) => sub.categoryId === categoryId);
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Category handlers
  const handleOpenAddCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryTypeId(selectedTypeId || '');
    setError(null);
    setCategoryDialogOpen(true);
  };

  const handleOpenEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryTypeId(category.transactionTypeId);
    setError(null);
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryTypeId('');
    setError(null);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }
    if (!categoryTypeId) {
      setError('Transaction type is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, categoryName.trim());
      } else {
        await onAddCategory(categoryName.trim(), categoryTypeId as number);
      }
      handleCloseCategoryDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save category';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteCategoryDialog = (category: Category) => {
    setItemToDelete(category);
    setError(null);
    setDeleteCategoryDialogOpen(true);
  };

  const handleCloseDeleteCategoryDialog = () => {
    setDeleteCategoryDialogOpen(false);
    setItemToDelete(null);
    setError(null);
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete) return;

    setSubmitting(true);
    setError(null);
    try {
      await onDeleteCategory(itemToDelete.id);
      handleCloseDeleteCategoryDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete category';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // SubCategory handlers
  const handleOpenAddSubCategoryDialog = (categoryId: number) => {
    setEditingSubCategory(null);
    setSubCategoryName('');
    setSubCategoryParentId(categoryId);
    setError(null);
    setSubCategoryDialogOpen(true);
  };

  const handleOpenEditSubCategoryDialog = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryName(subCategory.name);
    setSubCategoryParentId(subCategory.categoryId);
    setError(null);
    setSubCategoryDialogOpen(true);
  };

  const handleCloseSubCategoryDialog = () => {
    setSubCategoryDialogOpen(false);
    setEditingSubCategory(null);
    setSubCategoryName('');
    setSubCategoryParentId('');
    setError(null);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryName.trim()) {
      setError('Sub-category name is required');
      return;
    }
    if (!subCategoryParentId) {
      setError('Parent category is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (editingSubCategory) {
        await onUpdateSubCategory(editingSubCategory.id, subCategoryName.trim());
      } else {
        await onAddSubCategory(subCategoryName.trim(), subCategoryParentId as number);
      }
      handleCloseSubCategoryDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save sub-category';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteSubCategoryDialog = (subCategory: SubCategory) => {
    setItemToDelete(subCategory);
    setError(null);
    setDeleteSubCategoryDialogOpen(true);
  };

  const handleCloseDeleteSubCategoryDialog = () => {
    setDeleteSubCategoryDialogOpen(false);
    setItemToDelete(null);
    setError(null);
  };

  const handleDeleteSubCategory = async () => {
    if (!itemToDelete) return;

    setSubmitting(true);
    setError(null);
    try {
      await onDeleteSubCategory(itemToDelete.id);
      handleCloseDeleteSubCategoryDialog();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete sub-category';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Categories & Sub-Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddCategoryDialog}
          disabled={loading || transactionTypes.length === 0}
        >
          Add Category
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Transaction Type</InputLabel>
          <Select
            value={selectedTypeId}
            label="Transaction Type"
            onChange={(e) => setSelectedTypeId(e.target.value as number)}
            disabled={loading}
          >
            {transactionTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredCategories.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No categories found for this transaction type. Add your first category!
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredCategories.map((category, index) => {
              const categorySubCategories = getSubCategoriesForCategory(category.id);
              const isExpanded = expandedCategories.has(category.id);

              return (
                <React.Fragment key={category.id}>
                  <ListItem
                    divider={index < filteredCategories.length - 1 || isExpanded}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => toggleCategoryExpand(category.id)}
                      sx={{ mr: 1 }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <ListItemText
                      primary={category.name}
                      secondary={`${categorySubCategories.length} sub-categories`}
                    />
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenEditCategoryDialog(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleOpenDeleteCategoryDialog(category)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 6, pr: 2, py: 1, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Sub-Categories
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenAddSubCategoryDialog(category.id)}
                        >
                          Add Sub-Category
                        </Button>
                      </Box>
                      {categorySubCategories.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No sub-categories yet
                        </Typography>
                      ) : (
                        <List dense>
                          {categorySubCategories.map((subCat) => (
                            <ListItem
                              key={subCat.id}
                              sx={{ pl: 2 }}
                              secondaryAction={
                                <>
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleOpenEditSubCategoryDialog(subCat)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => handleOpenDeleteSubCategoryDialog(subCat)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              }
                            >
                              <ListItemText primary={subCat.name} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            type="text"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth disabled={submitting || !!editingCategory}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={categoryTypeId}
              label="Transaction Type"
              onChange={(e) => setCategoryTypeId(e.target.value as number)}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SubCategory Dialog */}
      <Dialog open={subCategoryDialogOpen} onClose={handleCloseSubCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubCategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Sub-Category Name"
            type="text"
            fullWidth
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth disabled={submitting || !!editingSubCategory}>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={subCategoryParentId}
              label="Parent Category"
              onChange={(e) => setSubCategoryParentId(e.target.value as number)}
            >
              {filteredCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubCategoryDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveSubCategory} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteCategoryDialogOpen} onClose={handleCloseDeleteCategoryDialog}>
        <DialogTitle>Confirm Delete Category</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete the category "{itemToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained" disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete SubCategory Dialog */}
      <Dialog open={deleteSubCategoryDialogOpen} onClose={handleCloseDeleteSubCategoryDialog}>
        <DialogTitle>Confirm Delete Sub-Category</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete the sub-category "{itemToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteSubCategoryDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSubCategory} color="error" variant="contained" disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
