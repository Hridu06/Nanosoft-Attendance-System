export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  employeeId: number | null;
  employeeName: string | null;
  employeeEmail: string | null;
  isActive: boolean;
  isBanned: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormInput {
  name: string;
  email: string;
  /** Required when creating a new user; leave blank on edit to keep the current password. */
  password: string;
  role: UserRole;
  employeeId: number | null;
}
