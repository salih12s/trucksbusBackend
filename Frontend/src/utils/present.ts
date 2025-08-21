/**
 * Utility functions for conditional rendering based on data presence
 */

/**
 * Checks if a value is present (not null, undefined, empty string, or "null" string)
 * @param v - Value to check
 * @returns true if value is present and meaningful
 */
export const isPresent = (v: any): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    return trimmed.length > 0 && trimmed.toLowerCase() !== 'null';
  }
  return true;
};

/**
 * Checks if a value is a positive finite number
 * @param v - Value to check
 * @returns true if value is a positive number
 */
export const isPositiveNumber = (v: any): boolean => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

/**
 * Formats phone number for display
 * @param phone - Phone number to format
 * @returns formatted phone number or null if not present
 */
export const formatPhoneForDisplay = (phone: any): string | null => {
  if (!isPresent(phone)) return null;
  
  // Remove all non-digit characters
  const digits = String(phone).replace(/\D/g, '');
  
  // Format Turkish phone numbers: (5XX) XXX XX XX
  if (digits.length === 10 && digits.startsWith('5')) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  
  return String(phone);
};

/**
 * Formats KM for display with thousands separator
 * @param km - KM value to format
 * @returns formatted KM string or null if not positive
 */
export const formatKMForDisplay = (km: any): string | null => {
  if (!isPositiveNumber(km)) return null;
  
  const kmNumber = Number(km);
  return kmNumber.toLocaleString('tr-TR') + ' km';
};

/**
 * Formats year for display
 * @param year - Year value to format
 * @returns formatted year string or null if not valid
 */
export const formatYearForDisplay = (year: any): string | null => {
  if (!isPositiveNumber(year)) return null;
  
  const yearNumber = Number(year);
  // Check if year is reasonable (between 1900 and current year + 2)
  const currentYear = new Date().getFullYear();
  if (yearNumber < 1900 || yearNumber > currentYear + 2) return null;
  
  return String(yearNumber);
};
