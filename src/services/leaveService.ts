import type { LeaveRequest, LeaveStatus } from "../types/leave";

let leaveRequests: LeaveRequest[] = [
  {
    id: "l1",
    employeeId: "e1",
    type: "sick",
    startDate: "2026-08-13",
    endDate: "2026-08-14",
    reason: "Fever and cold, need rest.",
    status: "pending",
    appliedOn: "2026-08-11",
  },
  {
    id: "l2",
    employeeId: "e2",
    type: "casual",
    startDate: "2026-08-17",
    endDate: "2026-08-17",
    reason: "Personal work.",
    status: "pending",
    appliedOn: "2026-08-12",
  },
  {
    id: "l3",
    employeeId: "e3",
    type: "annual",
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    reason: "Family trip.",
    status: "approved",
    appliedOn: "2026-07-10",
  },
  {
    id: "l4",
    employeeId: "e1",
    type: "unpaid",
    startDate: "2026-06-05",
    endDate: "2026-06-05",
    reason: "Emergency at home.",
    status: "rejected",
    appliedOn: "2026-06-03",
  },
  {
    id: "l5",
    employeeId: "e4",
    type: "casual",
    startDate: "2026-08-20",
    endDate: "2026-08-21",
    reason: "Attending a relative's wedding.",
    status: "pending",
    appliedOn: "2026-08-12",
  },
];

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getLeaveRequests = (): Promise<LeaveRequest[]> => {
  const sorted = [...leaveRequests].sort((a, b) =>
    b.appliedOn.localeCompare(a.appliedOn),
  );

  return delay(sorted);
};

export const updateLeaveStatus = (
  id: string,
  status: LeaveStatus,
): Promise<LeaveRequest> => {
  leaveRequests = leaveRequests.map((request) =>
    request.id === id ? { ...request, status } : request,
  );

  const updated = leaveRequests.find((request) => request.id === id);
  return delay(updated!);
};

export const countLeaveDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
};
