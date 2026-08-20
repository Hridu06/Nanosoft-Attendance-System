import { apiRequest } from "./api";
import type { User, UserFormInput, UserRole } from "../types/user";

interface ApiUserFull {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  employee: { id: number; full_name: string; email: string } | null;
  is_active: boolean;
  is_banned: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserListResponse {
  users: ApiUserFull[];
}

interface UserResponse {
  message: string;
  user: ApiUserFull;
}

const toUser = (data: ApiUserFull): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role,
  employeeId: data.employee?.id ?? null,
  employeeName: data.employee?.full_name ?? null,
  employeeEmail: data.employee?.email ?? null,
  isActive: data.is_active,
  isBanned: data.is_banned,
  twoFactorEnabled: data.two_factor_enabled,
  lastLoginAt: data.last_login_at,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const toRequestBody = (input: UserFormInput) => ({
  name: input.name,
  email: input.email,
  ...(input.password ? { password: input.password } : {}),
  role: input.role,
  employee_id: input.employeeId,
});

export const getUsers = async (filters?: { role?: UserRole }): Promise<User[]> => {
  const query = filters?.role ? `?role=${filters.role}` : "";
  const data = await apiRequest<UserListResponse>(`/users${query}`);
  return data.users.map(toUser);
};

export const getUser = async (id: number): Promise<User> => {
  const data = await apiRequest<{ user: ApiUserFull }>(`/users/${id}`);
  return toUser(data.user);
};

export const createUser = async (input: UserFormInput): Promise<User> => {
  const data = await apiRequest<UserResponse>("/users", {
    method: "POST",
    body: toRequestBody(input),
  });

  return toUser(data.user);
};

export const updateUser = async (
  id: number,
  input: UserFormInput,
): Promise<User> => {
  const data = await apiRequest<UserResponse>(`/users/${id}`, {
    method: "PUT",
    body: toRequestBody(input),
  });

  return toUser(data.user);
};

export const deleteUser = (id: number): Promise<void> =>
  apiRequest(`/users/${id}`, { method: "DELETE" });
