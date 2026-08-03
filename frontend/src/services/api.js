// API Service module with JWT token management and auto-refresh

const BASE_URL = 'http://localhost:8080/api';

export const getStoredToken = () => localStorage.getItem('access_token');
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthSession = (accessToken, refreshToken, user) => {
  if (accessToken) localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export async function apiFetch(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiry & Automatic Refresh Token Swap
  if (response.status === 401 && localStorage.getItem('refresh_token')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getStoredToken()}`;
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      clearAuthSession();
      window.dispatchEvent(new Event('auth-expired'));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred.' }));
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }

  // Handle 24 NO CONTENT
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }
  return false;
}
