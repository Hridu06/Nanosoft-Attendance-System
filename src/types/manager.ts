export type ManagerStatus = "active" | "inactive";

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: ManagerStatus;
}

export type ManagerFormInput = Omit<Manager, "id">;

export interface ManagerOption {
  id: string;
  name: string;
}
