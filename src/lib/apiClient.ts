let inMemorySessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  inMemorySessionToken = token;
}

export function getSessionToken(): string | null {
  return inMemorySessionToken;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiFetch<T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (inMemorySessionToken) {
    headers['Authorization'] = `Bearer ${inMemorySessionToken}`;
  }

  let bodyPayload: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      bodyPayload = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      bodyPayload = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: bodyPayload,
    credentials: 'include',
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return text as unknown as T;
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}

export function isAnalyticsTrackingAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('ash_privacy_consent') !== 'declined';
  } catch {
    return true;
  }
}
