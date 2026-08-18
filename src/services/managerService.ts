import { apiRequest } from "./api";
import type { Manager, ManagerFormInput } from "../types/manager";

interface ApiManager {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  department: { id: number; name: string } | null;
  status: Manager["status"];
}

interface ManagerListResponse {
  managers: ApiManager[];
}

interface ManagerResponse {
  message: string;
  manager: ApiManager;
}

const toManager = (data: ApiManager): Manager => ({
  id: String(data.id),
  userId: data.user_id,
  name: data.name,
  email: data.email,
  phone: data.phone ?? "",
  department: data.department?.name ?? "",
  departmentId: data.department?.id ?? null,
  status: data.status,
});

const toRequestBody = (input: ManagerFormInput) => ({
  user_id: input.userId,
  department_id: input.departmentId,
  phone: input.phone || null,
  status: input.status,
});

export const getManagerList = async (): Promise<Manager[]> => {
  const data = await apiRequest<ManagerListResponse>("/managers");
  return data.managers.map(toManager);
};

export const createManager = async (
  input: ManagerFormInput,
): Promise<Manager> => {
  const data = await apiRequest<ManagerResponse>("/managers", {
    method: "POST",
    body: toRequestBody(input),
  });

  return toManager(data.manager);
};

export const updateManager = async (
  id: string,
  input: ManagerFormInput,
): Promise<Manager> => {
  const data = await apiRequest<ManagerResponse>(`/managers/${id}`, {
    method: "PUT",
    body: toRequestBody(input),
  });

  return toManager(data.manager);
};

export const deleteManager = (id: string): Promise<void> =>
  apiRequest(`/managers/${id}`, { method: "DELETE" });
