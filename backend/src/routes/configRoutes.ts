import { Router } from 'express';
import configController from '../controllers/configController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

/**
 * Configuration Routes
 * GET routes: All authenticated users can read shared configuration data
 * POST/PUT/DELETE routes: Admin only for managing shared configuration
 */

// ==================== Transaction Types ====================
// All users can read transaction types (shared data)
router.get('/types', authenticateToken, configController.getAllTransactionTypes.bind(configController));
// Only admins can create/delete transaction types
router.post('/types', authenticateToken, authorizeRole('admin'), configController.createTransactionType.bind(configController));
router.delete('/types/:id', authenticateToken, authorizeRole('admin'), configController.deleteTransactionType.bind(configController));

// ==================== Categories ====================
// All users can read categories (shared data)
router.get('/categories', authenticateToken, configController.getAllCategories.bind(configController));
// Only admins can create/update/delete categories
router.post('/categories', authenticateToken, authorizeRole('admin'), configController.createCategory.bind(configController));
router.put('/categories/:id', authenticateToken, authorizeRole('admin'), configController.updateCategory.bind(configController));
router.delete('/categories/:id', authenticateToken, authorizeRole('admin'), configController.deleteCategory.bind(configController));

// ==================== Sub-Categories ====================
// All users can read sub-categories (shared data)
router.get('/subcategories', authenticateToken, configController.getAllSubCategories.bind(configController));
// Only admins can create/update/delete sub-categories
router.post('/subcategories', authenticateToken, authorizeRole('admin'), configController.createSubCategory.bind(configController));
router.put('/subcategories/:id', authenticateToken, authorizeRole('admin'), configController.updateSubCategory.bind(configController));
router.delete('/subcategories/:id', authenticateToken, authorizeRole('admin'), configController.deleteSubCategory.bind(configController));

// ==================== Payment Modes ====================
// All users can read payment modes (shared data)
router.get('/modes', authenticateToken, configController.getAllPaymentModes.bind(configController));
// Only admins can create/delete payment modes
router.post('/modes', authenticateToken, authorizeRole('admin'), configController.createPaymentMode.bind(configController));
router.delete('/modes/:id', authenticateToken, authorizeRole('admin'), configController.deletePaymentMode.bind(configController));

// ==================== Accounts ====================
// Temporary: Allow all users to read accounts (should be user-specific in future)
// TODO: Add user_id to accounts table and filter by user
router.get('/accounts', authenticateToken, configController.getAllAccounts.bind(configController));
router.post('/accounts', authenticateToken, authorizeRole('admin'), configController.createAccount.bind(configController));
router.delete('/accounts/:id', authenticateToken, authorizeRole('admin'), configController.deleteAccount.bind(configController));

export default router;
