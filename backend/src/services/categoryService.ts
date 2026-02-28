import categoryRepository from '../repositories/categoryRepository';
import transactionTypeRepository from '../repositories/transactionTypeRepository';
import { Category } from '../types/models';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for category business logic
 */
export class CategoryService {
  /**
   * Get all categories with optional transaction type filter
   */
  async getAllCategories(transactionTypeId?: number): Promise<Category[]> {
    return await categoryRepository.findAll(transactionTypeId);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return await categoryRepository.findById(id);
  }

  /**
   * Validate category data
   */
  private async validateCategoryData(data: CreateCategoryDTO | UpdateCategoryDTO, isCreate: boolean = false): Promise<void> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate name
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Name is required' });
      } else if (data.name.length > 100) {
        errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
      }
    } else if (isCreate) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    // Validate transaction type ID
    if ('transactionTypeId' in data && data.transactionTypeId !== undefined) {
      if (!data.transactionTypeId) {
        errors.push({ field: 'transactionTypeId', message: 'Transaction type ID is required' });
      } else {
        // Verify that the transaction type exists
        try {
          await transactionTypeRepository.findById(data.transactionTypeId);
        } catch (error) {
          errors.push({ field: 'transactionTypeId', message: 'Invalid transaction type ID' });
        }
      }
    } else if (isCreate) {
      errors.push({ field: 'transactionTypeId', message: 'Transaction type ID is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    // Validate data
    await this.validateCategoryData(data, true);

    // Create the category
    return await categoryRepository.create(data);
  }

  /**
   * Update a category
   */
  async updateCategory(id: number, data: UpdateCategoryDTO): Promise<Category> {
    // Validate data if provided
    if (Object.keys(data).length > 0) {
      await this.validateCategoryData(data, false);
    }

    // Update the category
    return await categoryRepository.update(id, data);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    await categoryRepository.delete(id);
  }
}

export default new CategoryService();
