import accountRepository from '../repositories/accountRepository';
import { Account } from '../types/models';
import { CreateAccountDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for account business logic
 */
export class AccountService {
  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    return await accountRepository.findAll();
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: number): Promise<Account> {
    return await accountRepository.findById(id);
  }

  /**
   * Validate account data
   */
  private validateAccountData(data: CreateAccountDTO): void {
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Create a new account
   */
  async createAccount(data: CreateAccountDTO): Promise<Account> {
    // Validate data
    this.validateAccountData(data);

    // Create the account
    return await accountRepository.create(data);
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: number): Promise<void> {
    await accountRepository.delete(id);
  }
}

export default new AccountService();
