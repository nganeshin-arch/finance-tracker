import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { configService } from '../services';
import { getApiErrorMessage } from '../services/api';
import {
  TransactionType,
  Category,
  SubCategory,
  PaymentMode,
  Account,
} from '../types';

interface ConfigContextType {
  transactionTypes: TransactionType[];
  categories: Category[];
  subCategories: SubCategory[];
  paymentModes: PaymentMode[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAllConfig: () => Promise<void>;
  fetchCategories: (transactionTypeId?: number) => Promise<Category[]>;
  fetchSubCategories: (categoryId?: number) => Promise<SubCategory[]>;
  addTransactionType: (name: string) => Promise<TransactionType>;
  deleteTransactionType: (id: number) => Promise<void>;
  addCategory: (name: string, transactionTypeId: number) => Promise<Category>;
  updateCategory: (id: number, name: string) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  addSubCategory: (name: string, categoryId: number) => Promise<SubCategory>;
  updateSubCategory: (id: number, name: string) => Promise<SubCategory>;
  deleteSubCategory: (id: number) => Promise<void>;
  addPaymentMode: (name: string) => Promise<PaymentMode>;
  deletePaymentMode: (id: number) => Promise<void>;
  addAccount: (name: string) => Promise<Account>;
  deleteAccount: (id: number) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
};

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
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
      console.error('Error fetching configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (transactionTypeId?: number) => {
    try {
      const data = await configService.getCategories(transactionTypeId);
      setCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      throw err;
    }
  }, []);

  const fetchSubCategories = useCallback(async (categoryId?: number) => {
    try {
      const data = await configService.getSubCategories(categoryId);
      setSubCategories(data);
      return data;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching sub-categories:', err);
      throw err;
    }
  }, []);

  const addTransactionType = async (name: string): Promise<TransactionType> => {
    setLoading(true);
    setError(null);
    try {
      const newType = await configService.createTransactionType({ name });
      setTransactionTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating transaction type:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransactionType = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await configService.deleteTransactionType(id);
      setTransactionTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting transaction type:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, transactionTypeId: number): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await configService.createCategory({ name, transactionTypeId });
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, name: string): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await configService.updateCategory(id, { name });
      setCategories((prev) => prev.map((c) => (c.id === id ? updatedCategory : c)));
      return updatedCategory;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error updating category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await configService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addSubCategory = async (name: string, categoryId: number): Promise<SubCategory> => {
    setLoading(true);
    setError(null);
    try {
      const newSubCategory = await configService.createSubCategory({ name, categoryId });
      setSubCategories((prev) => [...prev, newSubCategory]);
      return newSubCategory;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating sub-category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubCategory = async (id: number, name: string): Promise<SubCategory> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSubCategory = await configService.updateSubCategory(id, { name });
      setSubCategories((prev) => prev.map((sc) => (sc.id === id ? updatedSubCategory : sc)));
      return updatedSubCategory;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error updating sub-category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await configService.deleteSubCategory(id);
      setSubCategories((prev) => prev.filter((sc) => sc.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting sub-category:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMode = async (name: string): Promise<PaymentMode> => {
    setLoading(true);
    setError(null);
    try {
      const newMode = await configService.createPaymentMode({ name });
      setPaymentModes((prev) => [...prev, newMode]);
      return newMode;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating payment mode:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMode = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await configService.deletePaymentMode(id);
      setPaymentModes((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting payment mode:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (name: string): Promise<Account> => {
    setLoading(true);
    setError(null);
    try {
      const newAccount = await configService.createAccount({ name });
      setAccounts((prev) => [...prev, newAccount]);
      return newAccount;
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error creating account:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await configService.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting account:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConfig();
  }, [fetchAllConfig]);

  const value: ConfigContextType = {
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
    addTransactionType,
    deleteTransactionType,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    addPaymentMode,
    deletePaymentMode,
    addAccount,
    deleteAccount,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
