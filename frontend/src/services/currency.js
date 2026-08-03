// Currency Conversion & Automatic Geolocation Utility

const RATES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', rate: 84.5, locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, locale: 'en-GB' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, locale: 'en-CA' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, locale: 'ja-JP' }
};

const COUNTRY_CURRENCY_MAP = {
  IN: 'INR',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  AU: 'AUD',
  CA: 'CAD',
  JP: 'JPY',
  US: 'USD'
};

// 1. Instant Synchronous Auto-Detection via TimeZone & Browser Locale
function detectLocalCurrencySync() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const language = navigator.language || navigator.userLanguage || '';

    if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Asia/Dhaka') || language.endsWith('IN') || language.startsWith('hi')) {
      return 'INR';
    }
    if (timeZone.includes('Europe/London') || language.endsWith('GB') || language.startsWith('en-GB')) {
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
    if (timeZone.includes('America/Toronto') || timeZone.includes('America/Vancouver')) {
      return 'CAD';
    }
  } catch (e) {
    // fallback
  }
  return 'INR'; // Default to INR for regional Indian setup if detected, or USD
}

let activeCurrency = localStorage.getItem('user_currency') || detectLocalCurrencySync();
const listeners = new Set();

// 2. Asynchronous IP Geolocation Auto-Detection
export async function initAutoLocationCurrency() {
  if (localStorage.getItem('user_currency_manual')) return;

  try {
    const res = await fetch('https://ipapi.co/json/').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      const countryCode = data.country_code || data.country;
      const detectedCurr = COUNTRY_CURRENCY_MAP[countryCode] || data.currency;

      if (detectedCurr && RATES[detectedCurr] && detectedCurr !== activeCurrency) {
        activeCurrency = detectedCurr;
        localStorage.setItem('user_currency', activeCurrency);
        listeners.forEach((cb) => cb(activeCurrency));
      }
    }
  } catch (err) {
    // Keep sync detected currency
  }
}

// Auto-run IP geolocation detection on module load
initAutoLocationCurrency();

export function getActiveCurrency() {
  return activeCurrency;
}

export function setActiveCurrency(currencyCode, isManual = true) {
  if (RATES[currencyCode]) {
    activeCurrency = currencyCode;
    localStorage.setItem('user_currency', currencyCode);
    if (isManual) {
      localStorage.setItem('user_currency_manual', 'true');
    }
    listeners.forEach((cb) => cb(activeCurrency));
  }
}

export function subscribeCurrencyChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Formats price into the user's active regional currency.
 */
export function formatPrice(amount, baseCurrency = null, overrideTargetCurrency = null) {
  const num = Number(amount) || 0;

  const targetCode = (overrideTargetCurrency && RATES[overrideTargetCurrency])
    ? overrideTargetCurrency
    : activeCurrency;
  const targetCurr = RATES[targetCode] || RATES.USD;

  let usdAmount = num;
  if (baseCurrency && RATES[baseCurrency] && RATES[baseCurrency].rate > 0) {
    usdAmount = num / RATES[baseCurrency].rate;
  }

  const converted = usdAmount * targetCurr.rate;

  return new Intl.NumberFormat(targetCurr.locale, {
    style: 'currency',
    currency: targetCurr.code,
    maximumFractionDigits: targetCurr.code === 'JPY' ? 0 : 2,
    minimumFractionDigits: targetCurr.code === 'JPY' ? 0 : (converted % 1 === 0 ? 0 : 2)
  }).format(converted);
}

export function getAvailableCurrencies() {
  return Object.values(RATES);
}
