import subCategoryRepository from '../repositories/subCategoryRepository';
import categoryRepository from '../repositories/categoryRepository';
import { SubCategory } from '../types/models';
import { CreateSubCategoryDTO, UpdateSubCategoryDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for sub-category business logic
 */
export class SubCategoryService {
  /**
   * Get all sub-categories with optional category filter
   */
  async getAllSubCategories(categoryId?: number): Promise<SubCategory[]> {
    return await subCategoryRepository.findAll(categoryId);
  }

  /**
   * Get sub-category by ID
   */
  async getSubCategoryById(id: number): Promise<SubCategory> {
    return await subCategoryRepository.findById(id);
  }

  /**
   * Validate sub-category data
   */
  private async validateSubCategoryData(data: CreateSubCategoryDTO | UpdateSubCategoryDTO, isCreate: boolean = false): Promise<void> {
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

    // Validate category ID
    if ('categoryId' in data && data.categoryId !== undefined) {
      if (!data.categoryId) {
        errors.push({ field: 'categoryId', message: 'Category ID is required' });
      } else {
        // Verify that the category exists
        try {
          await categoryRepository.findById(data.categoryId);
        } catch (error) {
          errors.push({ field: 'categoryId', message: 'Invalid category ID' });
        }
      }
    } else if (isCreate) {
      errors.push({ field: 'categoryId', message: 'Category ID is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Create a new sub-category
   */
  async createSubCategory(data: CreateSubCategoryDTO): Promise<SubCategory> {
    // Validate data
    await this.validateSubCategoryData(data, true);

    // Create the sub-category
    return await subCategoryRepository.create(data);
  }

  /**
   * Update a sub-category
   */
  async updateSubCategory(id: number, data: UpdateSubCategoryDTO): Promise<SubCategory> {
    // Validate data if provided
    if (Object.keys(data).length > 0) {
      await this.validateSubCategoryData(data, false);
    }

    // Update the sub-category
    return await subCategoryRepository.update(id, data);
  }

  /**
   * Delete a sub-category
   */
  async deleteSubCategory(id: number): Promise<void> {
    await subCategoryRepository.delete(id);
  }
}

export default new SubCategoryService();
