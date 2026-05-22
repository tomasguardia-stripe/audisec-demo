const STRIPE_KEY_STORAGE = 'audisec-demo-stripe-key';

export function getStoredKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STRIPE_KEY_STORAGE);
}

export function setStoredKey(key: string) {
  localStorage.setItem(STRIPE_KEY_STORAGE, key);
}

export function clearStoredKey() {
  localStorage.removeItem(STRIPE_KEY_STORAGE);
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const key = getStoredKey();
  const headers = new Headers(options.headers);
  if (key) {
    headers.set('x-stripe-key', key);
  }
  return fetch(url, { ...options, headers });
}
