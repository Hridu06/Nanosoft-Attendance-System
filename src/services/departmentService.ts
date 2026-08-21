import { apiRequest } from "./api";
import type { Department, DepartmentFormInput } from "../types/department";

interface DepartmentListResponse {
  departments: Department[];
}

interface DepartmentResponse {
  message: string;
  department: Department;
}

let departmentListCache: Promise<Department[]> | null = null;

export const getDepartmentList = (): Promise<Department[]> => {
  if (!departmentListCache) {
    departmentListCache = apiRequest<DepartmentListResponse>("/departments")
      .then((data) => data.departments)
      .catch((error) => {
        departmentListCache = null;
        throw error;
      });
  }

  return departmentListCache;
};

export const createDepartment = async (
  input: DepartmentFormInput,
): Promise<Department> => {
  const data = await apiRequest<DepartmentResponse>("/departments", {
    method: "POST",
    body: input,
  });

  departmentListCache = null;
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

  departmentListCache = null;
  return data.department;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await apiRequest(`/departments/${id}`, { method: "DELETE" });
  departmentListCache = null;
};
