import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services';
import { getApiErrorMessage } from '../services/api';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';

export const useTransactions = (initialFilters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (filters?: TransactionFilters) => {
      setLoading(true);
      setError(null);
      try {
        const data = await transactionService.getTransactions(
          filters || initialFilters
        );
        setTransactions(data);
      } catch (err: any) {
        const errorMessage = getApiErrorMessage(err);
        setError(errorMessage);
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    },
    [initialFilters]
  );

  const createTransaction = async (data: CreateTransactionDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newTransaction = await transactionService.createTransaction(data);
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to create transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: number, data: UpdateTransactionDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTransaction = await transactionService.updateTransaction(
        id,
        data
      );
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );
      return updatedTransaction;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to update transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await transactionService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to delete transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
