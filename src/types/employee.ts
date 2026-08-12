export type { ManagerOption } from "./manager";

export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  managerId: string | null;
  managerName: string | null;
  joinDate: string;
  status: EmployeeStatus;
}

export type EmployeeFormInput = Omit<Employee, "id">;
