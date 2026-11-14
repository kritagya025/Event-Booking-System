// Regional Currency Configuration: Scoped Exclusively to India (INR ₹)

const RATES = {
  INR: { code: 'INR', symbol: '₹', rate: 84.5, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', rate: 1.0, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, locale: 'en-GB' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, locale: 'en-CA' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, locale: 'ja-JP' }
};

// Fixed to Indian Rupee (INR)
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('user_currency', 'INR');
  localStorage.removeItem('user_currency_manual');
}

export function getActiveCurrency() {
  return 'INR';
}

export function setActiveCurrency() {
  // Currency switcher is disabled for now; locked strictly to INR
  return 'INR';
}

export function subscribeCurrencyChange() {
  return () => {};
}

/**
 * Formats price into Indian Rupee (INR ₹) using standard en-IN formatting.
 * If the event has a legacy base currency (like USD from early seed data),
 * it seamlessly converts it at the standard conversion rate.
 */
export function formatPrice(amount, baseCurrency = null) {
  const num = Number(amount) || 0;

  let inrAmount = num;
  if (baseCurrency === 'USD') {
    inrAmount = num * 84.5;
  } else if (baseCurrency && RATES[baseCurrency] && RATES[baseCurrency].rate > 0 && baseCurrency !== 'INR') {
    inrAmount = (num / RATES[baseCurrency].rate) * 84.5;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: inrAmount % 1 === 0 ? 0 : 2
  }).format(inrAmount);
}

export function getAvailableCurrencies() {
  return [RATES.INR];
}
