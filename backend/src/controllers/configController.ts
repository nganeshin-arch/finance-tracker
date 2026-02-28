import { Request, Response, NextFunction } from 'express';
import transactionTypeService from '../services/transactionTypeService';
import categoryService from '../services/categoryService';
import subCategoryService from '../services/subCategoryService';
import paymentModeService from '../services/paymentModeService';
import accountService from '../services/accountService';

/**
 * Controller for configuration endpoints
 */
export class ConfigController {
  // ==================== Transaction Types ====================
  
  /**
   * GET /api/config/types
   * Get all transaction types
   */
  async getAllTransactionTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = await transactionTypeService.getAllTransactionTypes();
      res.json(types);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/config/types
   * Create a new transaction type
   */
  async createTransactionType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = await transactionTypeService.createTransactionType(req.body);
      res.status(201).json(type);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/config/types/:id
   * Delete a transaction type
   */
  async deleteTransactionType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid transaction type ID'
        });
        return;
      }
      
      await transactionTypeService.deleteTransactionType(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== Categories ====================
  
  /**
   * GET /api/config/categories
   * Get all categories (with optional transaction type filter)
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactionTypeId = req.query.transactionTypeId 
        ? parseInt(req.query.transactionTypeId as string) 
        : undefined;
      
      if (req.query.transactionTypeId && isNaN(transactionTypeId!)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid transaction type ID'
        });
        return;
      }
      
      const categories = await categoryService.getAllCategories(transactionTypeId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/config/categories
   * Create a new category
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/config/categories/:id
   * Update a category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid category ID'
        });
        return;
      }
      
      const category = await categoryService.updateCategory(id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/config/categories/:id
   * Delete a category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid category ID'
        });
        return;
      }
      
      await categoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== Sub-Categories ====================
  
  /**
   * GET /api/config/subcategories
   * Get all sub-categories (with optional category filter)
   */
  async getAllSubCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.query.categoryId 
        ? parseInt(req.query.categoryId as string) 
        : undefined;
      
      if (req.query.categoryId && isNaN(categoryId!)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid category ID'
        });
        return;
      }
      
      const subCategories = await subCategoryService.getAllSubCategories(categoryId);
      res.json(subCategories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/config/subcategories
   * Create a new sub-category
   */
  async createSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subCategory = await subCategoryService.createSubCategory(req.body);
      res.status(201).json(subCategory);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/config/subcategories/:id
   * Update a sub-category
   */
  async updateSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid sub-category ID'
        });
        return;
      }
      
      const subCategory = await subCategoryService.updateSubCategory(id, req.body);
      res.json(subCategory);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/config/subcategories/:id
   * Delete a sub-category
   */
  async deleteSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid sub-category ID'
        });
        return;
      }
      
      await subCategoryService.deleteSubCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== Payment Modes ====================
  
  /**
   * GET /api/config/modes
   * Get all payment modes
   */
  async getAllPaymentModes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modes = await paymentModeService.getAllPaymentModes();
      res.json(modes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/config/modes
   * Create a new payment mode
   */
  async createPaymentMode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mode = await paymentModeService.createPaymentMode(req.body);
      res.status(201).json(mode);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/config/modes/:id
   * Delete a payment mode
   */
  async deletePaymentMode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid payment mode ID'
        });
        return;
      }
      
      await paymentModeService.deletePaymentMode(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== Accounts ====================
  
  /**
   * GET /api/config/accounts
   * Get all accounts
   */
  async getAllAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await accountService.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/config/accounts
   * Create a new account
   */
  async createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.createAccount(req.body);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/config/accounts/:id
   * Delete an account
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid account ID'
        });
        return;
      }
      
      await accountService.deleteAccount(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ConfigController();
