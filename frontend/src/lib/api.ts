import { getDeviceId } from './device';
import { Gbairai, Comment, PaginatedResponse, LikeToggleResponse, ReportResponse } from '@/types/gbairai';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Enhanced fetch wrapper that attaches device headers and handles JSON parsing.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const deviceId = getDeviceId();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || `Erreur API: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
}

export interface FetchGbairaisParams {
  page?: number;
  sort?: 'latest' | 'hot';
  location?: string;
}

/**
 * Fetch feed of active Gbairais
 */
export async function getGbairais(params: FetchGbairaisParams = {}): Promise<PaginatedResponse<Gbairai>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.location && params.location !== 'Tous') {
    searchParams.set('location', params.location);
  }

  const query = searchParams.toString();
  return apiFetch<PaginatedResponse<Gbairai>>(`/gbairais${query ? `?${query}` : ''}`);
}

/**
 * Create a new Gbairai confession
 */
export async function createGbairai(payload: { content: string; location?: string }): Promise<{ data: Gbairai }> {
  const deviceId = getDeviceId();
  return apiFetch<{ data: Gbairai }>('/gbairais', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      device_id: deviceId,
    }),
  });
}

/**
 * Toggle like for a Gbairai
 */
export async function toggleLike(id: number): Promise<LikeToggleResponse> {
  const deviceId = getDeviceId();
  return apiFetch<LikeToggleResponse>(`/gbairais/${id}/like`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

/**
 * Report a Gbairai
 */
export async function reportGbairai(id: number): Promise<ReportResponse> {
  return apiFetch<ReportResponse>(`/gbairais/${id}/report`, {
    method: 'POST',
  });
}

/**
 * Delete a Gbairai (only if author)
 */
export async function deleteGbairai(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/gbairais/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch comments for a Gbairai
 */
export async function getComments(gbairaiId: number): Promise<{ data: Comment[] }> {
  return apiFetch<{ data: Comment[] }>(`/gbairais/${gbairaiId}/comments`);
}

/**
 * Add a comment to a Gbairai
 */
export async function addComment(gbairaiId: number, content: string): Promise<{ data: Comment }> {
  const deviceId = getDeviceId();
  return apiFetch<{ data: Comment }>(`/gbairais/${gbairaiId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      device_id: deviceId,
    }),
  });
}

