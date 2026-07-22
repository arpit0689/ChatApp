import { API_BASE_URL } from '../config';
import type { ApiError, Message, Room, User } from '../types';

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  errors?: Array<{ field?: string; message: string }>;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
  query?: Record<string, string | number>;
};

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const queryString = query
    ? Object.entries(query)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';

  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
  console.error('API Error:', error);
  throw error;
}

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.errors?.map((item: { message: string }) => item.message).join('. ') ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    const error = new Error(message) as ApiError;
    error.statusCode = response.status;
    error.errors = payload?.errors;
    throw error;
  }

  return payload;
};

export const authService = {
  register: (username: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: { username, email, password },
    }),

  login: (username: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),

  guestLogin: (username: string) =>
    request<{ user: User }>('/auth/guest', {
      method: 'POST',
      body: { username },
    }),
};

export const roomService = {
  getAllRooms: (token = '', page = 1, limit = 100) =>
    request<{ rooms: Room[] }>('/rooms', {
      token,
      query: { page, limit },
    }),

  createRoom: (name: string, description: string, token = '') =>
    request<Room>('/rooms', {
      method: 'POST',
      token,
      body: { name, description },
    }),
};

export const messageService = {
  getMessagesByRoom: (roomId: string, page = 1, limit = 50) =>
    request<{ messages: Message[] }>(`/messages/${roomId}`, {
      query: { page, limit },
    }),
};
