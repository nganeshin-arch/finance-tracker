import api from './api';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from '../types';

export const transactionService = {
  // Get all transactions with optional filters
  getTransactions: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (data: CreateTransactionDTO): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (
    id: number,
    data: UpdateTransactionDTO
  ): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};
