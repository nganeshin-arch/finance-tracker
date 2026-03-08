import React, { useState, useEffect } from 'react';
import { Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useConfigContext } from '../contexts/ConfigContext';
import { CreateTransactionDTO, Transaction } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import { Loading } from './Loading';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionDTO) => Promise<void>;
  onCancel: () => void;
}

const transactionSchema = yup.object({
  date: yup.string().required('Date is required'),
  transactionTypeId: yup.number().required('Transaction type is required').positive(),
  categoryId: yup.number().required('Category is required').positive(),
  subCategoryId: yup.number().required('Sub-category is required').positive(),
  paymentModeId: yup.number().required('Payment mode is required').positive(),
  accountId: yup.number().required('Account is required').positive(),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be a positive number')
    .typeError('Amount must be a valid number'),
  description: yup.string().optional(),
}).required();

type TransactionFormData = yup.InferType<typeof transactionSchema>;

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
}) => {
  const {
    transactionTypes,
    categories,
    subCategories,
    paymentModes,
    accounts,
    loading: configLoading,
  } = useConfigContext();

  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [filteredSubCategories, setFilteredSubCategories] = useState(subCategories);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema),
    defaultValues: transaction
      ? {
          date: formatDateForInput(transaction.date),
          transactionTypeId: transaction.transactionTypeId,
          categoryId: transaction.categoryId,
          subCategoryId: transaction.subCategoryId,
          paymentModeId: transaction.paymentModeId,
          accountId: transaction.accountId,
          amount: transaction.amount,
          description: transaction.description || '',
        }
      : {
          date: formatDateForInput(new Date()),
          transactionTypeId: 0,
          categoryId: 0,
          subCategoryId: 0,
          paymentModeId: 0,
          accountId: 0,
          amount: 0,
          description: '',
        },
  });

  const selectedTransactionTypeId = watch('transactionTypeId');
  const selectedCategoryId = watch('categoryId');

  // Filter categories when transaction type changes
  useEffect(() => {
    if (selectedTransactionTypeId > 0) {
      const filtered = categories.filter(
        (cat) => cat.transactionTypeId === selectedTransactionTypeId
      );
      setFilteredCategories(filtered);

      // Reset category and sub-category if current selection is invalid
      const currentCategoryId = watch('categoryId');
      if (currentCategoryId > 0 && !filtered.find((c) => c.id === currentCategoryId)) {
        setValue('categoryId', 0);
        setValue('subCategoryId', 0);
      }
    } else {
      setFilteredCategories([]);
      setValue('categoryId', 0);
      setValue('subCategoryId', 0);
    }
  }, [selectedTransactionTypeId, categories, setValue, watch]);

  // Filter sub-categories when category changes
  useEffect(() => {
    if (selectedCategoryId > 0) {
      const filtered = subCategories.filter(
        (subCat) => subCat.categoryId === selectedCategoryId
      );
      setFilteredSubCategories(filtered);

      // Reset sub-category if current selection is invalid
      const currentSubCategoryId = watch('subCategoryId');
      if (currentSubCategoryId > 0 && !filtered.find((sc) => sc.id === currentSubCategoryId)) {
        setValue('subCategoryId', 0);
      }
    } else {
      setFilteredSubCategories([]);
      setValue('subCategoryId', 0);
    }
  }, [selectedCategoryId, subCategories, setValue, watch]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const dto: CreateTransactionDTO = {
        date: data.date,
        transactionTypeId: data.transactionTypeId,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        paymentModeId: data.paymentModeId,
        accountId: data.accountId,
        amount: data.amount,
        description: data.description || undefined,
      };

      await onSubmit(dto);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading && transactionTypes.length === 0) {
    return <Loading message="Loading form data..." />;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <CardTitle className="text-2xl font-bold">
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form 
          onSubmit={handleSubmit(handleFormSubmit)}
          aria-label={transaction ? 'Edit transaction form' : 'Create transaction form'}
          className="space-y-5"
        >
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {submitError}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="date"
                  type="date"
                  error={errors.date?.message}
                  aria-label="Transaction date"
                  aria-required="true"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionTypeId">Transaction Type</Label>
            <Controller
              name="transactionTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger 
                    id="transactionTypeId"
                    aria-label="Transaction type"
                    aria-required="true"
                    aria-invalid={errors.transactionTypeId ? "true" : undefined}
                    aria-describedby={errors.transactionTypeId ? "transactionTypeId-error" : undefined}
                    className={errors.transactionTypeId ? 'border-destructive-500' : ''}
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
              )}
            />
            {errors.transactionTypeId && (
              <p 
                id="transactionTypeId-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.transactionTypeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={!selectedTransactionTypeId || filteredCategories.length === 0}
                >
                  <SelectTrigger 
                    id="categoryId"
                    aria-label="Category"
                    aria-required="true"
                    aria-invalid={errors.categoryId ? "true" : undefined}
                    aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
                    className={errors.categoryId ? 'border-destructive-500' : ''}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p 
                id="categoryId-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCategoryId">Sub-Category</Label>
            <Controller
              name="subCategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={!selectedCategoryId || filteredSubCategories.length === 0}
                >
                  <SelectTrigger 
                    id="subCategoryId"
                    aria-label="Sub-category"
                    aria-required="true"
                    aria-invalid={errors.subCategoryId ? "true" : undefined}
                    aria-describedby={errors.subCategoryId ? "subCategoryId-error" : undefined}
                    className={errors.subCategoryId ? 'border-destructive-500' : ''}
                  >
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubCategories.map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subCategoryId && (
              <p 
                id="subCategoryId-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.subCategoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentModeId">Payment Mode</Label>
            <Controller
              name="paymentModeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger 
                    id="paymentModeId"
                    aria-label="Payment mode"
                    aria-required="true"
                    aria-invalid={errors.paymentModeId ? "true" : undefined}
                    aria-describedby={errors.paymentModeId ? "paymentModeId-error" : undefined}
                    className={errors.paymentModeId ? 'border-destructive-500' : ''}
                  >
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id.toString()}>
                        {mode.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentModeId && (
              <p 
                id="paymentModeId-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.paymentModeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger 
                    id="accountId"
                    aria-label="Account"
                    aria-required="true"
                    aria-invalid={errors.accountId ? "true" : undefined}
                    aria-describedby={errors.accountId ? "accountId-error" : undefined}
                    className={errors.accountId ? 'border-destructive-500' : ''}
                  >
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && (
              <p 
                id="accountId-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.accountId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  error={errors.amount?.message}
                  aria-label="Amount"
                  aria-required="true"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground transition-all duration-200 ease-smooth hover:border-input/80 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  aria-label="Description"
                  aria-invalid={errors.description ? "true" : undefined}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
              )}
            />
            {errors.description && (
              <p 
                id="description-error"
                className="mt-1.5 text-sm text-destructive-600 dark:text-destructive-400 flex items-center gap-1.5 animate-fade-in" 
                role="alert"
              >
                <svg 
                  className="w-4 h-4 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              disabled={submitting || configLoading}
              aria-label={transaction ? 'Update transaction' : 'Create transaction'}
            >
              {submitting ? 'Saving...' : transaction ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={submitting}
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
