import { useState, useEffect, useCallback } from 'react';
import { configService } from '../services';
import { getApiErrorMessage } from '../services/api';
import {
  TransactionType,
  Category,
  SubCategory,
  PaymentMode,
  Account,
} from '../types';

export const useConfig = () => {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, cats, subCats, modes, accts] = await Promise.all([
        configService.getTransactionTypes(),
        configService.getCategories(),
        configService.getSubCategories(),
        configService.getPaymentModes(),
        configService.getAccounts(),
      ]);
      setTransactionTypes(types);
      setCategories(cats);
      setSubCategories(subCats);
      setPaymentModes(modes);
      setAccounts(accts);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async (transactionTypeId?: number) => {
    try {
      const data = await configService.getCategories(transactionTypeId);
      setCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch categories:', err);
      throw err;
    }
  };

  const fetchSubCategories = async (categoryId?: number) => {
    try {
      const data = await configService.getSubCategories(categoryId);
      setSubCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch sub-categories:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAllConfig();
  }, [fetchAllConfig]);

  return {
    transactionTypes,
    categories,
    subCategories,
    paymentModes,
    accounts,
    loading,
    error,
    fetchAllConfig,
    fetchCategories,
    fetchSubCategories,
  };
};
