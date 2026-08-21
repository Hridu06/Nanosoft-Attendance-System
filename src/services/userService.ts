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

const userListCache = new Map<string, Promise<User[]>>();

export const getUsers = (filters?: { role?: UserRole }): Promise<User[]> => {
  const key = filters?.role ?? "all";

  if (!userListCache.has(key)) {
    const query = filters?.role ? `?role=${filters.role}` : "";
    const request = apiRequest<UserListResponse>(`/users${query}`)
      .then((data) => data.users.map(toUser))
      .catch((error) => {
        userListCache.delete(key);
        throw error;
      });

    userListCache.set(key, request);
  }

  return userListCache.get(key)!;
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

  userListCache.clear();
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

  userListCache.clear();
  return toUser(data.user);
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiRequest(`/users/${id}`, { method: "DELETE" });
  userListCache.clear();
};
