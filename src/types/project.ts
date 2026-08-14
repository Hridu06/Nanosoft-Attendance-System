export type ProjectStatus = "active" | "completed" | "on-hold";

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  employeeIds: string[];
}

export type ProjectFormInput = Omit<Project, "id">;
