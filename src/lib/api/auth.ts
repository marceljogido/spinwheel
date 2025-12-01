const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://spinwheel.digioh.id';

const handleAuthResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json() as Promise<T>;
};

export type LoginResult = {
  token: string;
  expiresAt: number;
};

export type AuthProfile = {
  username: string;
  expiresAt: number;
};

export const login = async (username: string, password: string): Promise<LoginResult> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  return handleAuthResponse<LoginResult>(response);
};

export const logout = async (token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
};

export const fetchProfile = async (token: string): Promise<AuthProfile> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return handleAuthResponse<AuthProfile>(response);
};
