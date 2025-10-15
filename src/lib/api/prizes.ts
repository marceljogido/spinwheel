import type { Prize } from '@/types/prize';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type PrizePayload = {
  name: string;
  color: string;
  quota: number;
  winPercentage: number;
  image?: string | null;
  won?: number;
  sortIndex?: number;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json() as Promise<T>;
}

export async function listPrizes(): Promise<Prize[]> {
  const response = await fetch(`${API_BASE_URL}/prizes`, {
    credentials: 'include'
  });
  const data = await handleResponse<{ prizes: Prize[] }>(response);
  return data.prizes;
}

export async function createPrize(payload: PrizePayload): Promise<Prize> {
  const response = await fetch(`${API_BASE_URL}/prizes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await handleResponse<{ prize: Prize }>(response);
  return data.prize;
}

export async function updatePrize(id: string, payload: Partial<PrizePayload>): Promise<Prize> {
  const response = await fetch(`${API_BASE_URL}/prizes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await handleResponse<{ prize: Prize }>(response);
  return data.prize;
}

export async function deletePrize(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/prizes/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(await response.text());
  }
}

export async function recordPrizeWin(id: string): Promise<Prize> {
  const response = await fetch(`${API_BASE_URL}/prizes/${id}/win`, {
    method: 'POST',
    credentials: 'include'
  });
  const data = await handleResponse<{ prize: Prize }>(response);
  return data.prize;
}

export async function reorderPrizeSegments(order: Array<{ id: string; sortIndex: number }>): Promise<Prize[]> {
  const response = await fetch(`${API_BASE_URL}/prizes/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ order })
  });
  const data = await handleResponse<{ prizes: Prize[] }>(response);
  return data.prizes;
}
