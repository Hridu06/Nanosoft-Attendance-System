import type {
  AttendanceRecord,
  AttendanceStatus,
  Contribution,
} from "../types/attendance";
import { getContributions } from "./contributionService";
import { getAttendanceThresholds } from "./settingsService";

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateStatus = (
  totalMinutes: number,
  presentThresholdMin: number,
  halfDayThresholdMin: number,
  isLateArrival: boolean,
): AttendanceStatus => {
  if (totalMinutes >= presentThresholdMin) return isLateArrival ? "late" : "present";
  if (totalMinutes >= halfDayThresholdMin) return "half-day";
  return "absent";
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const [contributions, thresholds] = await Promise.all([
    getContributions(),
    getAttendanceThresholds(),
  ]);

  const presentThresholdMin = thresholds.presentHours * 60;
  const halfDayThresholdMin = thresholds.halfDayHours * 60;
  const officeStartMin = toMinutes(thresholds.officeStartTime);

  const grouped = new Map<string, Contribution[]>();

  for (const contribution of contributions) {
    const key = `${contribution.employeeId}__${contribution.date}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(contribution);
    grouped.set(key, bucket);
  }

  const records: AttendanceRecord[] = [];

  for (const [key, items] of grouped) {
    const [employeeId, date] = key.split("__");

    const totalMinutes = items.reduce(
      (sum, item) => sum + (toMinutes(item.endTime) - toMinutes(item.startTime)),
      0,
    );

    const earliestStartMin = Math.min(
      ...items.map((item) => toMinutes(item.startTime)),
    );
    const isLateArrival = earliestStartMin > officeStartMin;

    records.push({
      employeeId,
      date,
      totalMinutes,
      status: calculateStatus(
        totalMinutes,
        presentThresholdMin,
        halfDayThresholdMin,
        isLateArrival,
      ),
      projectIds: [...new Set(items.map((item) => item.projectId))],
      contributions: items,
    });
  }

  records.sort((a, b) => b.date.localeCompare(a.date));

  return records;
};

export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
