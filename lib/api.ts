const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export interface User {
  id: string;
  username: string;
  email: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, message);
  }

  return res.json();
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  author: { _id: string; username: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (username: string, email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  listPosts: () => apiFetch<Post[]>("/api/posts"),
  getPost: (slug: string) => apiFetch<Post>(`/api/posts/${slug}`),
  createPost: (data: { title: string; content: string }) =>
    apiFetch<Post>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePost: (slug: string, data: { title: string; content: string }) =>
    apiFetch<Post>(`/api/posts/${slug}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePost: (slug: string) =>
    apiFetch<{ message: string }>(`/api/posts/${slug}`, { method: "DELETE" }),
};

export function authorId(post: Post): string {
  return typeof post.author === "string" ? post.author : post.author._id;
}
