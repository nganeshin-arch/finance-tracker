import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useConfigContext } from '../contexts/ConfigContext';
import { CreateTransactionDTO, Transaction } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import { formatIndianCurrency, formatCurrencyInput } from '../utils/currencyUtils';
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
  const [amountDisplay, setAmountDisplay] = useState<string>('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
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
  const selectedAmount = watch('amount');

  // Initialize amount display when transaction is loaded or form resets
  useEffect(() => {
    if (transaction?.amount) {
      setAmountDisplay(formatIndianCurrency(transaction.amount).replace('₹', ''));
    } else if (selectedAmount === 0) {
      setAmountDisplay('');
    }
  }, [transaction, selectedAmount]);

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
      
      // Reset form to initial values after successful submission
      // Only reset if this is a create form (not edit)
      if (!transaction) {
        reset({
          date: formatDateForInput(new Date()),
          transactionTypeId: 0,
          categoryId: 0,
          subCategoryId: 0,
          paymentModeId: 0,
          accountId: 0,
          amount: 0,
          description: '',
        });
        // Clear amount display
        setAmountDisplay('');
      }
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
    <div className="w-full max-w-none font-inter">
      <form 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="space-y-6 font-inter"
        aria-label={transaction ? 'Edit transaction form' : 'Create transaction form'}
      >
        {submitError && (
          <div 
            className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200"
            role="alert"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {submitError}
            </div>
          </div>
        )}

      {/* Responsive grid layout - Single column on mobile, 2 columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Transaction Type Selector - Spans full width on all screens */}
        <div className="lg:col-span-2 space-y-3">
          <Label htmlFor="transactionType" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Transaction Type <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="transactionTypeId"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-3" role="group" aria-label="Transaction type">
                {transactionTypes.map((type) => {
                  const isSelected = field.value === type.id;
                  const color = getTransactionTypeColor(type.id);
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => field.onChange(type.id)}
                      className={cn(
                        "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 font-inter",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                        "min-h-[44px] min-w-[100px]", // Larger touch targets
                        isSelected && color === 'income' && "bg-green-500 text-white hover:bg-green-600 shadow-md",
                        isSelected && color === 'expense' && "bg-red-500 text-white hover:bg-red-600 shadow-md",
                        isSelected && color === 'neutral' && "bg-blue-500 text-white hover:bg-blue-600 shadow-md",
                        !isSelected && "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
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
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.transactionTypeId.message}
            </p>
          )}
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Transaction Date <span className="text-red-500">*</span>
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
                      "w-full justify-start text-left font-normal h-11 bg-white dark:bg-gray-800 font-inter",
                      "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md",
                      "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      !selectedDate && "text-gray-500 dark:text-gray-400",
                      errors.date && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    aria-label="Select transaction date"
                    aria-required="true"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="flex-1 text-left font-medium">
                      {selectedDate ? format(new Date(selectedDate), 'dd MMM yyyy') : 'Select date'}
                    </span>
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
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.date.message}
            </p>
          )}
        </div>

        {/* Amount Input with Currency Formatting */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Amount <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-lg font-inter">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="text"
                  value={amountDisplay}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Remove currency symbol and format
                    const cleaned = formatCurrencyInput(input);
                    setAmountDisplay(cleaned);
                    // Update form value with number
                    const numValue = parseFloat(cleaned) || 0;
                    field.onChange(numValue);
                  }}
                  onBlur={() => {
                    // Format with commas on blur if there's a value
                    if (field.value > 0) {
                      const formatted = formatIndianCurrency(field.value).replace('₹', '');
                      setAmountDisplay(formatted);
                    }
                  }}
                  onFocus={() => {
                    // Remove formatting on focus for easier editing
                    if (field.value > 0) {
                      setAmountDisplay(field.value.toString());
                    }
                  }}
                  placeholder="0.00"
                  className={cn(
                    "h-11 pl-10 text-lg bg-white dark:bg-gray-800 font-inter",
                    errors.amount && "border-red-500 focus-visible:ring-red-500"
                  )}
                  aria-label="Amount"
                  aria-required="true"
                  aria-invalid={!!errors.amount}
                />
              </div>
            )}
          />
          {errors.amount && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Category <span className="text-red-500">*</span>
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
                    "h-11 bg-white dark:bg-gray-800 font-inter",
                    errors.categoryId && "border-red-500 focus:ring-red-500"
                  )}
                  aria-label="Category"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()} className="font-inter">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Sub-Category Select */}
        <div className="space-y-2">
          <Label htmlFor="subCategory" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Sub-Category <span className="text-red-500">*</span>
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
                    "h-11 bg-white dark:bg-gray-800 font-inter",
                    errors.subCategoryId && "border-red-500 focus:ring-red-500"
                  )}
                  aria-label="Sub-category"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubCategories.map((subCategory) => (
                    <SelectItem key={subCategory.id} value={subCategory.id.toString()} className="font-inter">
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subCategoryId && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.subCategoryId.message}
            </p>
          )}
        </div>

        {/* Payment Mode Select */}
        <div className="space-y-2">
          <Label htmlFor="paymentMode" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Payment Mode <span className="text-red-500">*</span>
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
                    "h-11 bg-white dark:bg-gray-800 font-inter",
                    errors.paymentModeId && "border-red-500 focus:ring-red-500"
                  )}
                  aria-label="Payment mode"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id.toString()} className="font-inter">
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentModeId && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.paymentModeId.message}
            </p>
          )}
        </div>

        {/* Account Select */}
        <div className="space-y-2">
          <Label htmlFor="account" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
            Account <span className="text-red-500">*</span>
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
                    "h-11 bg-white dark:bg-gray-800 font-inter",
                    errors.accountId && "border-red-500 focus:ring-red-500"
                  )}
                  aria-label="Account"
                  aria-required="true"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()} className="font-inter">
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && (
            <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
              {errors.accountId.message}
            </p>
          )}
        </div>
      </div>

      {/* Description Textarea - Full width - Subtask 8.2 */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-inter">
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
                "flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm font-inter",
                "ring-offset-background placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                errors.description && "border-red-500 focus-visible:ring-red-500"
              )}
              aria-label="Description"
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400 font-inter" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium font-inter"
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
          className="flex-1 h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-inter"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </div>
      </form>
    </div>
  );
};
