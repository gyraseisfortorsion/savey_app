import { getCurrencySymbol } from '@/src/constants/currencies';

/**
 * Currencies where the symbol is written AFTER the number: 5 000 ₸, 5 000 ₽
 * All others get the symbol before: $5,000, €5,000
 */
const SUFFIX_SYMBOL_CURRENCIES = new Set([
  // Post-Soviet
  'KZT', 'RUB', 'UAH', 'GEL', 'AMD', 'AZN', 'UZS', 'TJS',
  // Central/Eastern European
  'HUF', 'RON', 'BGN', 'PLN', 'CZK',
  // Scandinavian
  'SEK', 'NOK', 'DKK',
  // Southeast Asian
  'VND',
]);

const numberFmt = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function fmtNumber(n: number): string {
  try {
    return numberFmt.format(n);
  } catch {
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}

export function formatCurrency(amount: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  const sign = amount < 0 ? '-' : '';
  const num = fmtNumber(Math.abs(amount));
  return SUFFIX_SYMBOL_CURRENCIES.has(currency)
    ? `${sign}${num} ${sym}`
    : `${sign}${sym}${num}`;
}

export function formatCompact(amount: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const suffix = SUFFIX_SYMBOL_CURRENCIES.has(currency);
  if (abs >= 1_000_000) {
    const n = `${(abs / 1_000_000).toFixed(1)}M`;
    return suffix ? `${sign}${n} ${sym}` : `${sign}${sym}${n}`;
  }
  if (abs >= 1_000) {
    const n = `${(abs / 1_000).toFixed(1)}K`;
    return suffix ? `${sign}${n} ${sym}` : `${sign}${sym}${n}`;
  }
  return formatCurrency(amount, currency);
}
