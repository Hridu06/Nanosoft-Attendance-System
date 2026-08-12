export type AttendanceStatus = "present" | "half-day" | "absent";

export interface Contribution {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  task: string;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  totalMinutes: number;
  status: AttendanceStatus;
  projectIds: string[];
  contributions: Contribution[];
}
