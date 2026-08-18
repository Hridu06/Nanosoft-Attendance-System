export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  departmentId: number | null;
  designation: string;
  designationId: number | null;
  managerId: string | null;
  managerName: string | null;
  joinDate: string;
  status: EmployeeStatus;
}

export interface EmployeeFormInput {
  name: string;
  email: string;
  phone: string;
  departmentId: number | null;
  designationId: number | null;
  managerId: string | null;
  joinDate: string;
  status: EmployeeStatus;
}
