// Currency Conversion & Localization Utility

const RATES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', rate: 84.5, locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, locale: 'en-GB' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, locale: 'en-CA' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, locale: 'ja-JP' }
};

// Auto-detect currency based on user's timezone & locale
function detectLocalCurrency() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const language = navigator.language || navigator.userLanguage || '';

    if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || language.endsWith('IN') || language.startsWith('hi')) {
      return 'INR';
    }
    if (timeZone.includes('Europe/London') || language.endsWith('GB')) {
      return 'GBP';
    }
    if (timeZone.includes('Europe/')) {
      return 'EUR';
    }
    if (timeZone.includes('Australia/')) {
      return 'AUD';
    }
    if (timeZone.includes('Tokyo') || language.startsWith('ja')) {
      return 'JPY';
    }
  } catch (e) {
    // fallback
  }
  return 'INR'; // Default to INR as requested for regional Indian setup if detected, or USD fallback
}

let activeCurrency = localStorage.getItem('user_currency') || detectLocalCurrency();
const listeners = new Set();

export function getActiveCurrency() {
  return activeCurrency;
}

export function setActiveCurrency(currencyCode) {
  if (RATES[currencyCode]) {
    activeCurrency = currencyCode;
    localStorage.setItem('user_currency', currencyCode);
    listeners.forEach((cb) => cb(activeCurrency));
  }
}

export function subscribeCurrencyChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function formatPrice(usdAmount, currencyCode = activeCurrency) {
  const num = Number(usdAmount) || 0;
  const curr = RATES[currencyCode] || RATES.USD;
  const converted = num * curr.rate;

  return new Intl.NumberFormat(curr.locale, {
    style: 'currency',
    currency: curr.code,
    maximumFractionDigits: curr.code === 'JPY' ? 0 : 2,
    minimumFractionDigits: curr.code === 'JPY' ? 0 : (converted % 1 === 0 ? 0 : 2)
  }).format(converted);
}

export function getAvailableCurrencies() {
  return Object.values(RATES);
}
