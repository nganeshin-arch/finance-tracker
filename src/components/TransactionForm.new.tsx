import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useConfigContext } from '../contexts/ConfigContext';
import { CreateTransactionDTO, Transaction } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Loading } from './ui/loading';

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
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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
  const selectedDate = watch('date');

  // Filter categories when transaction type changes
  useEffect(() => {
    if (selectedTransactionTypeId > 0) {
      const filtered = categories.filter(
        (cat) => cat.transactionTypeId === selectedTransactionTypeId
      );
      setFilteredCategories(filtered);

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

  // Get transaction type color
  const getTransactionTypeColor = (typeId: number) => {
    const type = transactionTypes.find(t => t.id === typeId);
    if (!type) return 'neutral';
    
    const name = type.name.toLowerCase();
    if (name.includes('income')) return 'income';
    if (name.includes('expense')) return 'expense';
    return 'neutral';
  };

  if (configLoading && transactionTypes.length === 0) {
    return <Loading message="Loading form data..." />;
  }

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="mt-4 space-y-6"
      aria-label={transaction ? 'Edit transaction form' : 'Create transaction form'}
    >
      {submitError && (
        <div 
          className="rounded-md bg-expense-50 dark:bg-expense-950/30 border border-expense-200 dark:border-expense-800 p-4 text-sm text-expense-800 dark:text-expense-200"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Pill-style Transaction Type Selector - Subtask 8.1 */}
      <div className="space-y-2">
        <Label htmlFor="transactionType" className="text-sm font-medium">
          Transaction Type <span className="text-expense-500">*</span>
        </Label>
        <Controller
          name="transactionTypeId"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Transaction type">
              {transactionTypes.map((type) => {
                const isSelected = field.value === type.id;
                const color = getTransactionTypeColor(type.id);
                
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => field.onChange(type.id)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "min-h-[44px]", // Touch target size
                      isSelected && color === 'income' && "bg-income-500 text-white hover:bg-income-600 shadow-md",
                      isSelected && color === 'expense' && "bg-expense-500 text-white hover:bg-expense-600 shadow-md",
                      isSelected && color === 'neutral' && "bg-neutral-500 text-white hover:bg-neutral-600 shadow-md",
                      !isSelected && "bg-muted text-muted-foreground hover:bg-muted/80 border border-input"
                    )}
                    aria-pressed={isSelected}
                    aria-label={type.name}
                  >
                    {type.name}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.transactionTypeId && (
          <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
            {errors.transactionTypeId.message}
          </p>
        )}
      </div>

      {/* Responsive 2-column grid for desktop, stacked on mobile - Subtask 8.3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Transaction Date <span className="text-expense-500">*</span>
          </Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !selectedDate && "text-muted-foreground",
                      errors.date && "border-expense-500 focus-visible:ring-expense-500"
                    )}
                    aria-label="Select transaction date"
                    aria-required="true"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(new Date(selectedDate), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(formatDateForInput(date));
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Amount Input - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount <span className="text-expense-500">*</span>
          </Label>
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
                placeholder="0.00"
                className={cn(
                  "h-10",
                  errors.amount && "border-expense-500 focus-visible:ring-expense-500"
                )}
                aria-label="Amount"
                aria-required="true"
                aria-invalid={!!errors.amount}
              />
            )}
          />
          {errors.amount && (
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Category Select - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-expense-500">*</span>
          </Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={!selectedTransactionTypeId || filteredCategories.length === 0}
              >
                <SelectTrigger 
                  className={cn(
                    "h-10",
                    errors.categoryId && "border-expense-500 focus:ring-expense-500"
                  )}
                  aria-label="Category"
                  aria-required="true"
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
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Sub-Category Select - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="subCategory" className="text-sm font-medium">
            Sub-Category <span className="text-expense-500">*</span>
          </Label>
          <Controller
            name="subCategoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(value) => field.onChange(parseInt(value))}
                disabled={!selectedCategoryId || filteredSubCategories.length === 0}
              >
                <SelectTrigger 
                  className={cn(
                    "h-10",
                    errors.subCategoryId && "border-expense-500 focus:ring-expense-500"
                  )}
                  aria-label="Sub-category"
                  aria-required="true"
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
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.subCategoryId.message}
            </p>
          )}
        </div>

        {/* Payment Mode Select - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="paymentMode" className="text-sm font-medium">
            Payment Mode <span className="text-expense-500">*</span>
          </Label>
          <Controller
            name="paymentModeId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <SelectTrigger 
                  className={cn(
                    "h-10",
                    errors.paymentModeId && "border-expense-500 focus:ring-expense-500"
                  )}
                  aria-label="Payment mode"
                  aria-required="true"
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
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.paymentModeId.message}
            </p>
          )}
        </div>

        {/* Account Select - Subtask 8.2 */}
        <div className="space-y-2">
          <Label htmlFor="account" className="text-sm font-medium">
            Account <span className="text-expense-500">*</span>
          </Label>
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value > 0 ? field.value.toString() : ''}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <SelectTrigger 
                  className={cn(
                    "h-10",
                    errors.accountId && "border-expense-500 focus:ring-expense-500"
                  )}
                  aria-label="Account"
                  aria-required="true"
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
            <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
              {errors.accountId.message}
            </p>
          )}
        </div>
      </div>

      {/* Description Textarea - Full width - Subtask 8.2 */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description (Optional)
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="description"
              rows={3}
              placeholder="Add a description..."
              className={cn(
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                errors.description && "border-expense-500 focus-visible:ring-expense-500"
              )}
              aria-label="Description"
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-expense-600 dark:text-expense-400" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Form Actions - Subtask 8.4 (Loading state) */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 h-11"
          disabled={submitting || configLoading}
          aria-label={transaction ? 'Update transaction' : 'Create transaction'}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            transaction ? 'Update Transaction' : 'Create Transaction'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
