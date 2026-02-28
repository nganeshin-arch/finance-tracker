import paymentModeRepository from '../repositories/paymentModeRepository';
import { PaymentMode } from '../types/models';
import { CreatePaymentModeDTO } from '../types/dtos';
import { ValidationError } from '../utils/errors';

/**
 * Service layer for payment mode business logic
 */
export class PaymentModeService {
  /**
   * Get all payment modes
   */
  async getAllPaymentModes(): Promise<PaymentMode[]> {
    return await paymentModeRepository.findAll();
  }

  /**
   * Get payment mode by ID
   */
  async getPaymentModeById(id: number): Promise<PaymentMode> {
    return await paymentModeRepository.findById(id);
  }

  /**
   * Validate payment mode data
   */
  private validatePaymentModeData(data: CreatePaymentModeDTO): void {
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
   * Create a new payment mode
   */
  async createPaymentMode(data: CreatePaymentModeDTO): Promise<PaymentMode> {
    // Validate data
    this.validatePaymentModeData(data);

    // Create the payment mode
    return await paymentModeRepository.create(data);
  }

  /**
   * Delete a payment mode
   */
  async deletePaymentMode(id: number): Promise<void> {
    await paymentModeRepository.delete(id);
  }
}

export default new PaymentModeService();
