export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'HKD',
  'SGD', 'SEK', 'KRW', 'NOK', 'NZD', 'MXN', 'TWD', 'ZAR', 'BRL', 'DKK',
  'PLN', 'THB', 'ILS', 'IDR', 'CZK', 'AED', 'TRY', 'HUF', 'CLP', 'SAR',
  'PHP', 'MYR', 'COP', 'RUB', 'RON', 'PEN', 'BHD', 'BGN', 'ARS', 'KZT',
  'UAH', 'EGP', 'VND', 'PKR', 'IQD', 'QAR', 'KWD', 'NGN', 'BDT', 'GEL',
  'UZS', 'AMD', 'AZN', 'TJS',
] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

/** Fallback symbol map for currencies Intl/Hermes may not resolve to a symbol */
const SYMBOL_MAP: Record<string, string> = {
  USD: '$',    EUR: '€',    GBP: '£',    JPY: '¥',    CNY: '¥',
  INR: '₹',   CAD: 'CA$',  AUD: 'A$',   CHF: 'CHF',  HKD: 'HK$',
  SGD: 'S$',  SEK: 'kr',   KRW: '₩',    NOK: 'kr',   NZD: 'NZ$',
  MXN: 'MX$', TWD: 'NT$',  ZAR: 'R',    BRL: 'R$',   DKK: 'kr',
  PLN: 'zł',  THB: '฿',    ILS: '₪',    IDR: 'Rp',   CZK: 'Kč',
  AED: 'د.إ', TRY: '₺',    HUF: 'Ft',   CLP: '$',    SAR: '﷼',
  PHP: '₱',   MYR: 'RM',   COP: '$',    RUB: '₽',    RON: 'lei',
  PEN: 'S/',  BHD: 'BD',   BGN: 'лв',   ARS: '$',    KZT: '₸',
  UAH: '₴',  EGP: 'E£',   VND: '₫',    PKR: '₨',    IQD: 'IQD',
  QAR: 'QR',  KWD: 'KD',   NGN: '₦',    BDT: '৳',    GEL: '₾',
  UZS: 'soʻm', AMD: '֏',   AZN: '₼',   TJS: 'SM',
};

/**
 * Get the display symbol for a currency code.
 * Tries Intl narrowSymbol first (works well on iOS), falls back to SYMBOL_MAP.
 */
export function getCurrencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const sym = parts.find((p) => p.type === 'currency')?.value;
    // If Intl returned the 3-letter code unchanged, it has no symbol data → use map
    if (sym && sym !== code) return sym;
  } catch {
    // Intl not supported or invalid code
  }
  return SYMBOL_MAP[code] ?? code;
}

/** Returns "KZT (₸)" label for use in currency picker lists */
export function getCurrencyLabel(code: string): string {
  const sym = getCurrencySymbol(code);
  return sym === code ? code : `${code} (${sym})`;
}
