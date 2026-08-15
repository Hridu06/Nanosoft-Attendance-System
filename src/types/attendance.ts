export type AttendanceStatus = "present" | "late" | "half-day" | "absent";

export type ContributionStatus = "pending" | "in-progress" | "completed";

export type ContributionType = "task" | "bug" | "feature" | "improvement";

export type ContributionPriority = "low" | "medium" | "high";

export interface Contribution {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  task: string;
  status: ContributionStatus;
  title?: string;
  type?: ContributionType;
  priority?: ContributionPriority;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  totalMinutes: number;
  status: AttendanceStatus;
  projectIds: string[];
  contributions: Contribution[];
}
