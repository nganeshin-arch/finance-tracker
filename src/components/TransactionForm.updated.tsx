import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useConfigContext } from '../contexts/ConfigContext';
import { CreateTransactionDTO, Transaction } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import { formatIndianCurrency, formatCurrencyInput } from '../utils/currencyUtils';
import { Loading } from './Loading';

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
  const [amountDisplay, setAmountDisplay] = useState('');

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
  const currentAmount = watch('amount');

  // Update amount display when amount changes
  useEffect(() => {
    if (currentAmount > 0) {
      setAmountDisplay(formatIndianCurrency(currentAmount));
    } else {
      setAmountDisplay('');
    }
  }, [currentAmount]);

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
      
      // Reset form after successful submission (only for new transactions)
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
        setAmountDisplay('');
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (value: string, onChange: (val: number) => void) => {
    const formatted = formatCurrencyInput(value);
    const numValue = parseFloat(formatted) || 0;
    onChange(numValue);
  };

  if (configLoading && transactionTypes.length === 0) {
    return <Loading message="Loading form data..." />;
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(handleFormSubmit)} 
      sx={{ mt: 2 }}
      aria-label={transaction ? 'Edit transaction form' : 'Create transaction form'}
    >
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          {submitError}
        </Alert>
      )}

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Transaction Date"
            type="date"
            error={!!errors.date}
            helperText={errors.date?.message}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              'aria-label': 'Transaction date',
              'aria-required': 'true',
            }}
          />
        )}
      />

      <Controller
        name="transactionTypeId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            label="Transaction Type"
            error={!!errors.transactionTypeId}
            helperText={errors.transactionTypeId?.message}
            margin="normal"
            inputProps={{
              'aria-label': 'Transaction type',
              'aria-required': 'true',
            }}
          >
            <MenuItem value={0} disabled>
              Select transaction type
            </MenuItem>
            {transactionTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            label="Category"
            error={!!errors.categoryId}
            helperText={errors.categoryId?.message}
            margin="normal"
            disabled={!selectedTransactionTypeId || filteredCategories.length === 0}
            inputProps={{
              'aria-label': 'Category',
              'aria-required': 'true',
            }}
          >
            <MenuItem value={0} disabled>
              Select category
            </MenuItem>
            {filteredCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="subCategoryId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            label="Sub-Category"
            error={!!errors.subCategoryId}
            helperText={errors.subCategoryId?.message}
            margin="normal"
            disabled={!selectedCategoryId || filteredSubCategories.length === 0}
            inputProps={{
              'aria-label': 'Sub-category',
              'aria-required': 'true',
            }}
          >
            <MenuItem value={0} disabled>
              Select sub-category
            </MenuItem>
            {filteredSubCategories.map((subCategory) => (
              <MenuItem key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="paymentModeId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            label="Payment Mode"
            error={!!errors.paymentModeId}
            helperText={errors.paymentModeId?.message}
            margin="normal"
            inputProps={{
              'aria-label': 'Payment mode',
              'aria-required': 'true',
            }}
          >
            <MenuItem value={0} disabled>
              Select payment mode
            </MenuItem>
            {paymentModes.map((mode) => (
              <MenuItem key={mode.id} value={mode.id}>
                {mode.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="accountId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            fullWidth
            label="Account"
            error={!!errors.accountId}
            helperText={errors.accountId?.message}
            margin="normal"
            inputProps={{
              'aria-label': 'Account',
              'aria-required': 'true',
            }}
          >
            <MenuItem value={0} disabled>
              Select account
            </MenuItem>
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="amount"
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <TextField
            {...field}
            fullWidth
            label="Amount"
            type="number"
            value={value || ''}
            onChange={(e) => handleAmountChange(e.target.value, onChange)}
            error={!!errors.amount}
            helperText={
              errors.amount?.message || 
              (value > 0 ? `Display: ${formatIndianCurrency(value)}` : '')
            }
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            inputProps={{ 
              step: '0.01', 
              min: '0',
              'aria-label': 'Amount in Indian Rupees',
              'aria-required': 'true',
            }}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
            inputProps={{
              'aria-label': 'Description',
            }}
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={submitting || configLoading}
          aria-label={transaction ? 'Update transaction' : 'Create transaction'}
          className="premium-button"
        >
          {submitting ? 'Saving...' : transaction ? 'Update' : 'Create Transaction'}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={submitting}
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};
