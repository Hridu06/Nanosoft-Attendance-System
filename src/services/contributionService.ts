import type { Contribution } from "../types/attendance";

let contributions: Contribution[] = [
  { id: "c1", employeeId: "e1", projectId: "p1", date: "2026-08-10", startTime: "09:00", endTime: "13:00", task: "Employee Management API", status: "completed" },
  { id: "c2", employeeId: "e1", projectId: "p2", date: "2026-08-10", startTime: "14:00", endTime: "17:00", task: "Attendance Module", status: "completed" },
  { id: "c3", employeeId: "e2", projectId: "p2", date: "2026-08-10", startTime: "09:30", endTime: "13:30", task: "UI Development", status: "completed" },
  { id: "c4", employeeId: "e3", projectId: "p1", date: "2026-08-10", startTime: "10:00", endTime: "12:00", task: "Design Review", status: "completed" },

  { id: "c5", employeeId: "e1", projectId: "p1", date: "2026-08-11", startTime: "09:00", endTime: "12:00", task: "Bug Fixes", status: "completed" },
  { id: "c6", employeeId: "e1", projectId: "p2", date: "2026-08-11", startTime: "13:00", endTime: "17:00", task: "Attendance Module", status: "in-progress" },
  { id: "c7", employeeId: "e2", projectId: "p2", date: "2026-08-11", startTime: "09:00", endTime: "15:00", task: "UI Development", status: "in-progress" },
  { id: "c8", employeeId: "e3", projectId: "p1", date: "2026-08-11", startTime: "09:00", endTime: "11:30", task: "Design Review", status: "completed" },

  { id: "c9", employeeId: "e1", projectId: "p1", date: "2026-08-12", startTime: "09:00", endTime: "12:00", task: "Employee Management API", status: "pending" },
  { id: "c10", employeeId: "e3", projectId: "p1", date: "2026-08-12", startTime: "09:00", endTime: "13:00", task: "Design Review", status: "pending" },
];

export type ContributionInput = Omit<Contribution, "id">;

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getContributions = (): Promise<Contribution[]> => {
  return delay([...contributions]);
};

export const getContributionsByProject = (
  projectId: string,
): Promise<Contribution[]> => {
  return delay(
    contributions
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
};

export const createContribution = (
  input: ContributionInput,
): Promise<Contribution> => {
  const contribution: Contribution = { id: crypto.randomUUID(), ...input };
  contributions = [contribution, ...contributions];
  return delay(contribution);
};

export const updateContribution = (
  id: string,
  input: ContributionInput,
): Promise<Contribution> => {
  contributions = contributions.map((contribution) =>
    contribution.id === id ? { id, ...input } : contribution,
  );

  return delay({ id, ...input });
};

export const deleteContribution = (id: string): Promise<void> => {
  contributions = contributions.filter((item) => item.id !== id);
  return delay(undefined);
};
