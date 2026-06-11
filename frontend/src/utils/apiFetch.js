// Centralized API fetch dengan auto-logout kalo token expired
// Semua halaman pake ini, bukan fetch() langsung

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/api';

export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // JWT expired / unauthorized → lempar error khusus
  if (res.status === 401) {
    const err = new Error('SESSION_EXPIRED');
    err.status = 401;
    throw err;
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const errMsg = json.errors
      ? Object.values(json.errors).flat().join(', ')
      : json.message || 'Terjadi kesalahan.';
    throw new Error(errMsg);
  }

  return json;
}