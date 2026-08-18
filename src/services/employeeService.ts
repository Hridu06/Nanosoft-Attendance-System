import { apiRequest } from "./api";
import type { Employee, EmployeeFormInput } from "../types/employee";

interface ApiEmployee {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  department: { id: number; name: string } | null;
  designation: { id: number; name: string } | null;
  manager: { id: number; full_name: string } | null;
  joining_date: string | null;
  status: Employee["status"];
}

interface EmployeeListResponse {
  employees: ApiEmployee[];
}

interface EmployeeResponse {
  message: string;
  employee: ApiEmployee;
}

const toEmployee = (data: ApiEmployee): Employee => ({
  id: String(data.id),
  name: data.full_name,
  email: data.email,
  phone: data.phone ?? "",
  department: data.department?.name ?? "",
  departmentId: data.department?.id ?? null,
  designation: data.designation?.name ?? "",
  designationId: data.designation?.id ?? null,
  managerId: data.manager ? String(data.manager.id) : null,
  managerName: data.manager?.full_name ?? null,
  joinDate: data.joining_date ?? "",
  status: data.status,
});

const toRequestBody = (input: EmployeeFormInput) => ({
  full_name: input.name,
  email: input.email,
  phone: input.phone || null,
  department_id: input.departmentId,
  designation_id: input.designationId,
  manager_id: input.managerId ? Number(input.managerId) : null,
  joining_date: input.joinDate,
  status: input.status,
});

export const getEmployees = async (): Promise<Employee[]> => {
  const data = await apiRequest<EmployeeListResponse>("/employees");
  return data.employees.map(toEmployee);
};

export const createEmployee = async (
  input: EmployeeFormInput,
): Promise<Employee> => {
  const data = await apiRequest<EmployeeResponse>("/employees", {
    method: "POST",
    body: toRequestBody(input),
  });

  return toEmployee(data.employee);
};

export const updateEmployee = async (
  id: string,
  input: EmployeeFormInput,
): Promise<Employee> => {
  const data = await apiRequest<EmployeeResponse>(`/employees/${id}`, {
    method: "PUT",
    body: toRequestBody(input),
  });

  return toEmployee(data.employee);
};

export const deleteEmployee = (id: string): Promise<void> =>
  apiRequest(`/employees/${id}`, { method: "DELETE" });
