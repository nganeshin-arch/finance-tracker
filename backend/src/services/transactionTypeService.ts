import transactionTypeRepository from '../repositories/transactionTypeRepository';
import { TransactionType } from '../types/models';
import { CreateTransactionTypeDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for transaction type business logic
 */
export class TransactionTypeService {
  /**
   * Get all transaction types
   */
  async getAllTransactionTypes(): Promise<TransactionType[]> {
    return await transactionTypeRepository.findAll();
  }

  /**
   * Get transaction type by ID
   */
  async getTransactionTypeById(id: number): Promise<TransactionType> {
    return await transactionTypeRepository.findById(id);
  }

  /**
   * Validate transaction type data
   */
  private validateTransactionTypeData(data: CreateTransactionTypeDTO): void {
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.length > 50) {
      errors.push({ field: 'name', message: 'Name must not exceed 50 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Create a new transaction type
   */
  async createTransactionType(data: CreateTransactionTypeDTO): Promise<TransactionType> {
    // Validate data
    this.validateTransactionTypeData(data);

    // Create the transaction type
    return await transactionTypeRepository.create(data);
  }

  /**
   * Delete a transaction type
   */
  async deleteTransactionType(id: number): Promise<void> {
    await transactionTypeRepository.delete(id);
  }
}

export default new TransactionTypeService();
