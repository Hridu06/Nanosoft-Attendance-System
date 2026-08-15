import { apiRequest } from "./api";
import type { ApiUser } from "../types/auth";

interface UserListResponse {
  users: ApiUser[];
}

export const getUserList = async (): Promise<ApiUser[]> => {
  const data = await apiRequest<UserListResponse>("/users");
  return data.users;
};
