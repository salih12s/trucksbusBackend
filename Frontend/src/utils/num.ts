export const toInt = (v: any) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

export const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');

// TRY price like "1.234.000" -> 1234000
export const parsePriceTRY = (raw: any) => {
  if (raw === null || raw === undefined) return undefined;
  const d = digitsOnly(String(raw));
  if (!d) return undefined;
  const n = Number(d);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const clean = (o: Record<string, any>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''));
