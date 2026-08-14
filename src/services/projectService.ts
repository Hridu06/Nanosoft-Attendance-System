import type { Project, ProjectFormInput } from "../types/project";

let projects: Project[] = [
  {
    id: "p1",
    name: "DSK Bangladesh",
    client: "DSK Bangladesh",
    description: "Employee management and HR platform.",
    status: "active",
    startDate: "2024-01-10",
    endDate: "2024-12-31",
    progress: 65,
    employeeIds: ["e1", "e3"],
  },
  {
    id: "p2",
    name: "HRM System",
    client: "Internal",
    description: "Attendance and contribution tracking module.",
    status: "active",
    startDate: "2024-03-05",
    endDate: "2024-09-30",
    progress: 40,
    employeeIds: ["e2"],
  },
  {
    id: "p3",
    name: "Nanosoft Website Revamp",
    client: "Nanosoft",
    description: "Marketing website redesign and rebuild.",
    status: "on-hold",
    startDate: "2023-09-18",
    endDate: "2024-06-30",
    progress: 20,
    employeeIds: [],
  },
];

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getProjects = (): Promise<Project[]> => {
  return delay([...projects]);
};

export const createProject = (input: ProjectFormInput): Promise<Project> => {
  const project: Project = { id: crypto.randomUUID(), ...input };
  projects = [project, ...projects];
  return delay(project);
};

export const updateProject = (
  id: string,
  input: ProjectFormInput,
): Promise<Project> => {
  projects = projects.map((project) =>
    project.id === id ? { id, ...input } : project,
  );

  return delay({ id, ...input });
};

export const deleteProject = (id: string): Promise<void> => {
  projects = projects.filter((project) => project.id !== id);
  return delay(undefined);
};
