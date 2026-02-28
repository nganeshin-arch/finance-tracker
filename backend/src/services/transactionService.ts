import transactionRepository from '../repositories/transactionRepository';
import transactionTypeRepository from '../repositories/transactionTypeRepository';
import categoryRepository from '../repositories/categoryRepository';
import subCategoryRepository from '../repositories/subCategoryRepository';
import paymentModeRepository from '../repositories/paymentModeRepository';
import accountRepository from '../repositories/accountRepository';
import trackingCycleRepository from '../repositories/trackingCycleRepository';
import { Transaction } from '../types/models';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../types/dtos';
import { TransactionFilters } from '../types/filters';
import { ValidationError, NotFoundError } from '../utils/errors';

/**
 * Service layer for transaction business logic
 */
export class TransactionService {
  /**
   * Get all transactions for a specific user with optional filtering
   */
  async getTransactions(userId: number, filters?: TransactionFilters): Promise<Transaction[]> {
    return await transactionRepository.findByUserId(userId, filters);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: number): Promise<Transaction> {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  /**
   * Validate transaction data
   */
  private async validateTransactionData(
    data: CreateTransactionDTO | UpdateTransactionDTO,
    isUpdate: boolean = false
  ): Promise<void> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate date
    if ('date' in data && data.date !== undefined) {
      if (!data.date) {
        errors.push({ field: 'date', message: 'Date is required' });
      } else {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
          errors.push({ field: 'date', message: 'Invalid date format' });
        }
      }
    } else if (!isUpdate) {
      errors.push({ field: 'date', message: 'Date is required' });
    }

    // Validate amount
    if ('amount' in data && data.amount !== undefined) {
      if (typeof data.amount !== 'number') {
        errors.push({ field: 'amount', message: 'Amount must be a number' });
      } else if (data.amount <= 0) {
        errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
      }
    } else if (!isUpdate) {
      errors.push({ field: 'amount', message: 'Amount is required' });
    }

    // Validate required fields for create
    if (!isUpdate) {
      if (!('transactionTypeId' in data) || data.transactionTypeId === undefined) {
        errors.push({ field: 'transactionTypeId', message: 'Transaction type is required' });
      }
      if (!('categoryId' in data) || data.categoryId === undefined) {
        errors.push({ field: 'categoryId', message: 'Category is required' });
      }
      if (!('subCategoryId' in data) || data.subCategoryId === undefined) {
        errors.push({ field: 'subCategoryId', message: 'Sub-category is required' });
      }
      if (!('paymentModeId' in data) || data.paymentModeId === undefined) {
        errors.push({ field: 'paymentModeId', message: 'Payment mode is required' });
      }
      if (!('accountId' in data) || data.accountId === undefined) {
        errors.push({ field: 'accountId', message: 'Account is required' });
      }
    }

    // Validate description length
    if ('description' in data && data.description !== undefined && data.description !== null) {
      if (data.description.length > 500) {
        errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // Validate foreign key references
    await this.validateForeignKeys(data);
  }

  /**
   * Validate foreign key references
   */
  private async validateForeignKeys(data: CreateTransactionDTO | UpdateTransactionDTO): Promise<void> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate tracking cycle if provided
    if ('trackingCycleId' in data && data.trackingCycleId !== undefined && data.trackingCycleId !== null) {
      try {
        await trackingCycleRepository.findById(data.trackingCycleId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'trackingCycleId', message: 'Invalid tracking cycle ID' });
        } else {
          throw error;
        }
      }
    }

    // Validate transaction type
    if ('transactionTypeId' in data && data.transactionTypeId !== undefined) {
      try {
        await transactionTypeRepository.findById(data.transactionTypeId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'transactionTypeId', message: 'Invalid transaction type ID' });
        } else {
          throw error;
        }
      }
    }

    // Validate category
    if ('categoryId' in data && data.categoryId !== undefined) {
      try {
        await categoryRepository.findById(data.categoryId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'categoryId', message: 'Invalid category ID' });
        } else {
          throw error;
        }
      }
    }

    // Validate sub-category
    if ('subCategoryId' in data && data.subCategoryId !== undefined) {
      try {
        const subCategory = await subCategoryRepository.findById(data.subCategoryId);
        
        // Validate that sub-category belongs to the selected category
        if ('categoryId' in data && data.categoryId !== undefined) {
          if (subCategory.categoryId !== data.categoryId) {
            errors.push({ 
              field: 'subCategoryId', 
              message: 'Sub-category does not belong to the selected category' 
            });
          }
        }
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'subCategoryId', message: 'Invalid sub-category ID' });
        } else {
          throw error;
        }
      }
    }

    // Validate payment mode
    if ('paymentModeId' in data && data.paymentModeId !== undefined) {
      try {
        await paymentModeRepository.findById(data.paymentModeId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'paymentModeId', message: 'Invalid payment mode ID' });
        } else {
          throw error;
        }
      }
    }

    // Validate account
    if ('accountId' in data && data.accountId !== undefined) {
      try {
        await accountRepository.findById(data.accountId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          errors.push({ field: 'accountId', message: 'Invalid account ID' });
        } else {
          throw error;
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Associate transaction with tracking cycle based on date
   */
  private async associateTrackingCycle(data: CreateTransactionDTO): Promise<CreateTransactionDTO> {
    // If tracking cycle is already specified, use it
    if (data.trackingCycleId) {
      return data;
    }

    // Try to find a tracking cycle that contains the transaction date
    const transactionDate = new Date(data.date);
    const allCycles = await trackingCycleRepository.findAll();
    
    for (const cycle of allCycles) {
      const startDate = new Date(cycle.startDate);
      const endDate = new Date(cycle.endDate);
      
      if (transactionDate >= startDate && transactionDate <= endDate) {
        return {
          ...data,
          trackingCycleId: cycle.id
        };
      }
    }

    // If no matching cycle found, return data as is (trackingCycleId will be null)
    return data;
  }

  /**
   * Create a new transaction
   */
  async createTransaction(userId: number, data: CreateTransactionDTO): Promise<Transaction> {
    // Validate transaction data
    await this.validateTransactionData(data, false);

    // Associate with tracking cycle if not specified
    const dataWithCycle = await this.associateTrackingCycle(data);

    // Create the transaction with userId
    return await transactionRepository.create(userId, dataWithCycle);
  }

  /**
   * Update a transaction
   */
  async updateTransaction(userId: number, id: number, data: UpdateTransactionDTO): Promise<Transaction> {
    // Validate data if provided
    if (Object.keys(data).length > 0) {
      await this.validateTransactionData(data, true);
    }

    // If date is being updated, re-associate with tracking cycle
    let updatedData = data;
    if (data.date) {
      const existing = await transactionRepository.findById(id, userId);
      if (!existing) {
        throw new NotFoundError(`Transaction with ID ${id} not found or access denied`);
      }
      updatedData = await this.associateTrackingCycle({
        ...existing,
        ...data,
        date: data.date
      } as CreateTransactionDTO);
    }

    // Update the transaction with ownership check
    return await transactionRepository.update(userId, id, updatedData);
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(userId: number, id: number): Promise<boolean> {
    const deleted = await transactionRepository.delete(userId, id);
    return deleted;
  }
}

export default new TransactionService();
