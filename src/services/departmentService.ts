import { apiRequest } from "./api";
import type { Department, DepartmentFormInput } from "../types/department";

interface DepartmentListResponse {
  departments: Department[];
}

interface DepartmentResponse {
  message: string;
  department: Department;
}

export const getDepartmentList = async (): Promise<Department[]> => {
  const data = await apiRequest<DepartmentListResponse>("/departments");
  return data.departments;
};

export const createDepartment = async (
  input: DepartmentFormInput,
): Promise<Department> => {
  const data = await apiRequest<DepartmentResponse>("/departments", {
    method: "POST",
    body: input,
  });

  return data.department;
};

export const updateDepartment = async (
  id: number,
  input: DepartmentFormInput,
): Promise<Department> => {
  const data = await apiRequest<DepartmentResponse>(`/departments/${id}`, {
    method: "PUT",
    body: input,
  });

  return data.department;
};

export const deleteDepartment = (id: number): Promise<void> =>
  apiRequest(`/departments/${id}`, { method: "DELETE" });
