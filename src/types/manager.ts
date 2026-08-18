export type ManagerStatus = "active" | "inactive";

export interface Manager {
  id: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  departmentId: number | null;
  status: ManagerStatus;
}

export interface ManagerFormInput {
  userId: number | null;
  departmentId: number | null;
  phone: string;
  status: ManagerStatus;
}
