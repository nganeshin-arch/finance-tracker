import api from './api';
import {
  TransactionType,
  Category,
  SubCategory,
  PaymentMode,
  Account,
} from '../types';

export const configService = {
  // Transaction Types
  getTransactionTypes: async (): Promise<TransactionType[]> => {
    const response = await api.get('/config/types');
    return response.data;
  },

  createTransactionType: async (data: { name: string }): Promise<TransactionType> => {
    const response = await api.post('/config/types', data);
    return response.data;
  },

  deleteTransactionType: async (id: number): Promise<void> => {
    await api.delete(`/config/types/${id}`);
  },

  // Categories
  getCategories: async (transactionTypeId?: number): Promise<Category[]> => {
    const params = transactionTypeId ? { transactionTypeId } : {};
    const response = await api.get('/config/categories', { params });
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    transactionTypeId: number;
  }): Promise<Category> => {
    const response = await api.post('/config/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name: string }): Promise<Category> => {
    const response = await api.put(`/config/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/config/categories/${id}`);
  },

  // Sub-Categories
  getSubCategories: async (categoryId?: number): Promise<SubCategory[]> => {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get('/config/subcategories', { params });
    return response.data;
  },

  createSubCategory: async (data: {
    name: string;
    categoryId: number;
  }): Promise<SubCategory> => {
    const response = await api.post('/config/subcategories', data);
    return response.data;
  },

  updateSubCategory: async (id: number, data: { name: string }): Promise<SubCategory> => {
    const response = await api.put(`/config/subcategories/${id}`, data);
    return response.data;
  },

  deleteSubCategory: async (id: number): Promise<void> => {
    await api.delete(`/config/subcategories/${id}`);
  },

  // Payment Modes
  getPaymentModes: async (): Promise<PaymentMode[]> => {
    const response = await api.get('/config/modes');
    return response.data;
  },

  createPaymentMode: async (data: { name: string }): Promise<PaymentMode> => {
    const response = await api.post('/config/modes', data);
    return response.data;
  },

  deletePaymentMode: async (id: number): Promise<void> => {
    await api.delete(`/config/modes/${id}`);
  },

  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/config/accounts');
    return response.data;
  },

  createAccount: async (data: { name: string }): Promise<Account> => {
    const response = await api.post('/config/accounts', data);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await api.delete(`/config/accounts/${id}`);
  },
};
