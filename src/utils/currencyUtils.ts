/**
 * Format number to Indian currency format (₹)
 * Example: 1234567.89 => ₹12,34,567.89
 */
export const formatIndianCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '₹0.00';
  }
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = num.toFixed(2).split('.');
  
  // Format integer part with Indian numbering system
  // Last 3 digits, then groups of 2
  const lastThree = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  
  const formattedInteger = otherDigits.length > 0
    ? otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
  
  return `₹${formattedInteger}.${decimalPart}`;
};

/**
 * Parse Indian currency string to number
 * Example: ₹12,34,567.89 => 1234567.89
 */
export const parseIndianCurrency = (value: string): number => {
  // Remove currency symbol and commas
  const cleaned = value.replace(/[₹,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Format input value as Indian currency while typing
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
};
