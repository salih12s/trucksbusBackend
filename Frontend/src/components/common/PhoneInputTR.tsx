import React, { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { normalizePhoneTR, formatPhoneTR, digitsOnly } from '../../utils/phone';

type PhoneInputTRProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (normalizedValue: string, displayValue: string, isValid: boolean) => void;
  required?: boolean;
  disabled?: boolean;
};

const PhoneInputTR: React.FC<PhoneInputTRProps> = ({ 
  value, 
  onChange, 
  required, 
  disabled, 
  error,
  helperText,
  ...rest 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // value değiştiğinde displayValue'yu güncelle
  useEffect(() => {
    const formatted = value ? formatPhoneTR(value) : '';
    setDisplayValue(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = digitsOnly(input);
    
    // Maksimum 11 haneli telefon numarası kabul et
    if (digits.length > 11) return;
    
    // Format uygula: xxxx xxx xx xx
    let formatted = '';
    if (digits.length > 0) {
      if (digits.length <= 4) {
        formatted = digits;
      } else if (digits.length <= 7) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else if (digits.length <= 9) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
      }
    }
    
    setDisplayValue(formatted);
    
    // Normalized değeri hesapla ve callback'i çağır
    const normalized = normalizePhoneTR(digits);
    const isValid = !!normalized;
    onChange(normalized, formatted, isValid);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Sadece sayılar, Backspace, Delete, Tab, Enter, Arrow tuşlarına izin ver
    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
      !(e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
    ) {
      e.preventDefault();
    }
  };

  return (
    <TextField
      {...rest}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      inputMode="numeric"
      placeholder="0xxx xxx xx xx"
      inputProps={{
        maxLength: 14, // "0xxx xxx xx xx" = 14 karakter (boşluklar dahil)
      }}
    />
  );
};

export default PhoneInputTR;
