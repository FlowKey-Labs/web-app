/**
 * Utility functions for string operations and conversions
 */

/**
 * Safely converts an unknown value to a lowercase string.
 * Handles various data types including objects with name/title properties.
 * 
 * @param value - The value to convert to string
 * @returns A lowercase string representation of the value, or empty string if conversion fails
 */
export const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return value.toString().toLowerCase();
  if (typeof value === 'object' && value && 'name' in value) {
    const obj = value as { name: unknown };
    return typeof obj.name === 'string' ? obj.name.toLowerCase() : '';
  }
  if (typeof value === 'object' && value && 'title' in value) {
    const obj = value as { title: unknown };
    return typeof obj.title === 'string' ? obj.title.toLowerCase() : '';
  }
  return '';
}; 

/**
 * Format currency value with business currency settings
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = 'KSH',
  currencySymbol: string = 'KSH'
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return `${currencySymbol} 0`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${currencySymbol} 0`;
  }

  // Format with commas for thousands
  const formattedAmount = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${currencySymbol} ${formattedAmount}`;
};

/**
 * Get currency placeholder text for input fields
 */
export const getCurrencyPlaceholder = (
  currency: string = 'KSH',
  currencySymbol: string = 'KSH'
): string => {
  return `Enter amount in ${currency}`;
};

/**
 * Parse currency input to numeric value
 */
export const parseCurrencyInput = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(cleanValue);
  
  return isNaN(numericValue) ? 0 : numericValue;
}; 