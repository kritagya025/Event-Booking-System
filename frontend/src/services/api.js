// API Service module with HttpOnly Cookie credentials, fast abort timeout, and auto-refresh

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isLocalhostHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// When deployed on HTTPS without a custom backend domain, localhost is unreachable from remote devices.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (isLocalhostHost ? 'http://localhost:8080/api' : '/api');

export const getStoredToken = () => null; // Tokens are securely stored in HttpOnly cookies
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthSession = (accessToken, refreshToken, user) => {
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('user');
};

export async function apiFetch(endpoint, options = {}) {
  // If running on a remote HTTPS site and backend is pointing to localhost, fail immediately
  // rather than hanging the browser network stack with 10-30s connection timeouts
  if (isHttps && !isLocalhostHost && !import.meta.env.VITE_API_BASE_URL && BASE_URL.includes('localhost')) {
    throw new Error('Local backend not accessible from remote production domain');
  }

  // Fast AbortController timeout to prevent page freezes
  const timeoutMs = options.timeout || 1500;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: options.signal || controller.signal,
      credentials: 'include',
      headers,
    });
    clearTimeout(timeoutId);

    // Handle Token Expiry & Automatic Refresh Token Swap via HttpOnly Cookies
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers,
        });
      } else {
        clearAuthSession();
        window.dispatchEvent(new Event('auth-expired'));
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred.' }));
      let msg = errorData.message || `HTTP Error ${response.status}`;
      if (errorData.details && typeof errorData.details === 'object') {
        const detailsList = Object.entries(errorData.details).map(([field, err]) => `${field}: ${err}`).join(', ');
        if (detailsList) {
          msg += ` (${detailsList})`;
        }
      }
      throw new Error(msg);
    }

    // Handle 204 NO CONTENT
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function tryRefreshToken() {
  if (isHttps && !isLocalhostHost && !import.meta.env.VITE_API_BASE_URL && BASE_URL.includes('localhost')) {
    return false;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      signal: controller.signal,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return true;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Token refresh unreachable:', err.message);
  }
  return false;
}
