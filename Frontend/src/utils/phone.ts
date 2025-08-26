/**
 * Turkish phone number utilities
 * Format: 0xxx xxx xx xx (11 digits total, starting with 0)
 */

export const digitsOnly = (s: string): string => (s || '').replace(/\D/g, '');

export const normalizePhoneTR = (raw: string): string => {
  // Returns canonical DB format '0XXXXXXXXXX' (11 digits) or '' if invalid
  const d = digitsOnly(raw);
  
  // Already 11 digits starting with 0
  if (d.length === 11 && d.startsWith('0')) {
    return d;
  }
  
  // 10 digits starting with 5 (mobile without leading 0)
  if (d.length === 10 && d.startsWith('5')) {
    return '0' + d;
  }
  
  return '';
};

export const isValidPhoneTR = (raw: string): boolean => {
  return !!normalizePhoneTR(raw);
};

export const formatPhoneTR = (raw: string): string => {
  const d = normalizePhoneTR(raw);
  if (!d) return '';
  
  // Format: xxxx xxx xx xx (11 digits without leading 0 formatting)
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
};

export const isValidMobilePhoneTR = (raw: string): boolean => {
  // Mobile phones must start with 05xx
  const normalized = normalizePhoneTR(raw);
  return normalized.length === 11 && normalized.startsWith('05');
};
