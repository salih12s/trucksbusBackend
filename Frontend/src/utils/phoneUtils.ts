/**
 * Telefon numarası formatting utilities
 */

export const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const numbers = value.replace(/\D/g, '');
  
  // Türkiye formatına göre düzenle (0xxx xxx xx xx)
  if (numbers.length <= 4) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
  } else {
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Rakamları al
  const numbers = phone.replace(/\D/g, '');
  // Türkiye telefon numarası 11 haneli olmalı ve 0 ile başlamalı
  return numbers.length === 11 && numbers.startsWith('0');
};
