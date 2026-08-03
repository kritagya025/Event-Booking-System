// API Service module with HttpOnly Cookie credentials and auto-refresh

const BASE_URL = 'http://localhost:8080/api';

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
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

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
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }
  return false;
}
