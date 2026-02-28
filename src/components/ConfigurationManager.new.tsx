import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Loading } from './ui/loading';

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
    // Form validation
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
    <div className="space-y-4">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <Button
          onClick={handleOpenAddDialog}
          disabled={loading}
          className="gap-2"
          aria-label={`Add new ${title}`}
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No items found. Add your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDeleteDialog(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {title}</DialogTitle>
            <DialogDescription>
              Enter a name for the new item. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">
                Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={submitting}
                placeholder="Enter name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdd();
                  }
                }}
                className={error && !newItemName.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}
                autoFocus
                aria-required="true"
                aria-invalid={error && !newItemName.trim() ? 'true' : 'false'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseAddDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4" />
                  Adding...
                </>
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
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
              Are you sure you want to delete <strong>"{selectedItem?.name}"</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
