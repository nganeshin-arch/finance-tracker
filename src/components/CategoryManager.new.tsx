import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loading } from './ui/loading';
import { TransactionType, Category, SubCategory } from '../types/models';

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
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Category dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryTypeId, setCategoryTypeId] = useState<string>('');

  // SubCategory dialogs
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryParentId, setSubCategoryParentId] = useState<string>('');

  // Delete dialogs
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteSubCategoryDialogOpen, setDeleteSubCategoryDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | SubCategory | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set default transaction type when types are loaded
  useEffect(() => {
    if (transactionTypes.length > 0 && selectedTypeId === '') {
      setSelectedTypeId(transactionTypes[0].id.toString());
    }
  }, [transactionTypes, selectedTypeId]);

  const filteredCategories = selectedTypeId
    ? categories.filter((cat) => cat.transactionTypeId === parseInt(selectedTypeId))
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
    setCategoryTypeId(category.transactionTypeId.toString());
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
        await onAddCategory(categoryName.trim(), parseInt(categoryTypeId));
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
    setSubCategoryParentId(categoryId.toString());
    setError(null);
    setSubCategoryDialogOpen(true);
  };

  const handleOpenEditSubCategoryDialog = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryName(subCategory.name);
    setSubCategoryParentId(subCategory.categoryId.toString());
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
        await onAddSubCategory(subCategoryName.trim(), parseInt(subCategoryParentId));
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
    <div className="space-y-4">
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categories & Sub-Categories</h2>
        <Button
          onClick={handleOpenAddCategoryDialog}
          disabled={loading || transactionTypes.length === 0}
          className="gap-2 w-full sm:w-auto"
          aria-label="Add new category"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Transaction Type Filter */}
      <div className="w-full sm:w-64">
        <Label htmlFor="transaction-type-filter" className="mb-2 block">
          Transaction Type
        </Label>
        <Select
          value={selectedTypeId}
          onValueChange={setSelectedTypeId}
          disabled={loading}
        >
          <SelectTrigger id="transaction-type-filter">
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No categories found for this transaction type. Add your first category!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredCategories.map((category) => {
            const categorySubCategories = getSubCategoriesForCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);

            return (
              <Card
                key={category.id}
                className="transition-all duration-200 hover:shadow-md"
              >
                {/* Category Header */}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCategoryExpand(category.id)}
                        className="h-8 w-8 shrink-0"
                        aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{category.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {categorySubCategories.length} sub-categor{categorySubCategories.length === 1 ? 'y' : 'ies'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditCategoryDialog(category)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteCategoryDialog(category)}
                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sub-Categories Section */}
                  {isExpanded && (
                    <div className="mt-4 pl-10 space-y-3 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-Categories</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAddSubCategoryDialog(category.id)}
                          className="gap-1 h-8"
                          aria-label={`Add sub-category to ${category.name}`}
                        >
                          <Plus className="h-3 w-3" />
                          Add Sub-Category
                        </Button>
                      </div>
                      {categorySubCategories.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No sub-categories yet</p>
                      ) : (
                        <div className="space-y-2">
                          {categorySubCategories.map((subCat) => (
                            <div
                              key={subCat.id}
                              className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <span className="text-sm text-gray-900 dark:text-white">{subCat.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditSubCategoryDialog(subCat)}
                                  className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  aria-label={`Edit ${subCat.name}`}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeleteSubCategoryDialog(subCat)}
                                  className="h-7 w-7 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  aria-label={`Delete ${subCat.name}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details below.'
                : 'Enter details for the new category. Click save when you\'re done.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={submitting}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCategory();
                  }
                }}
                className={error && !categoryName.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoFocus
                aria-required="true"
                aria-invalid={error && !categoryName.trim() ? 'true' : 'false'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-type">
                Transaction Type <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Select
                value={categoryTypeId}
                onValueChange={setCategoryTypeId}
                disabled={submitting || !!editingCategory}
              >
                <SelectTrigger
                  id="category-type"
                  className={error && !categoryTypeId ? 'border-red-500 focus:ring-red-500' : ''}
                  aria-required="true"
                  aria-invalid={error && !categoryTypeId ? 'true' : 'false'}
                >
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCategoryDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={submitting}>
              {submitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Dialog */}
      <Dialog open={subCategoryDialogOpen} onOpenChange={setSubCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubCategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}
            </DialogTitle>
            <DialogDescription>
              {editingSubCategory
                ? 'Update the sub-category details below.'
                : 'Enter details for the new sub-category. Click save when you\'re done.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">
                Sub-Category Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="subcategory-name"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                disabled={submitting}
                placeholder="Enter sub-category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveSubCategory();
                  }
                }}
                className={error && !subCategoryName.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoFocus
                aria-required="true"
                aria-invalid={error && !subCategoryName.trim() ? 'true' : 'false'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-parent">
                Parent Category <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Select
                value={subCategoryParentId}
                onValueChange={setSubCategoryParentId}
                disabled={submitting || !!editingSubCategory}
              >
                <SelectTrigger
                  id="subcategory-parent"
                  className={error && !subCategoryParentId ? 'border-red-500 focus:ring-red-500' : ''}
                  aria-required="true"
                  aria-invalid={error && !subCategoryParentId ? 'true' : 'false'}
                >
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseSubCategoryDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubCategory} disabled={submitting}>
              {submitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete Category</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the category <strong>"{itemToDelete?.name}"</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteCategoryDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete SubCategory Dialog */}
      <Dialog open={deleteSubCategoryDialogOpen} onOpenChange={setDeleteSubCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete Sub-Category</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the sub-category <strong>"{itemToDelete?.name}"</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteSubCategoryDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubCategory}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
