// Normalize helper functions for features and boolean values

export function normalizeFeatures(input: unknown): Record<string, boolean | string | number> {
  if (input == null) return {};
  
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch {
      return {};
    }
  }
  
  if (typeof input === 'object' && !Array.isArray(input)) {
    return input as any;
  }
  
  return {};
}

export const toBool = (v: any): boolean => {
  return v === true || v === 1 || v === '1' || v === 'true';
};

export const safeStringify = (obj: any): string => {
  try {
    if (obj && typeof obj === 'object') {
      return JSON.stringify(obj);
    }
    return JSON.stringify({});
  } catch {
    return JSON.stringify({});
  }
};
