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