export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "sick" | "casual" | "annual" | "unpaid";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}
