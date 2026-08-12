export interface AttendanceThresholds {
  presentHours: number;
  halfDayHours: number;
}

let thresholds: AttendanceThresholds = {
  presentHours: 6,
  halfDayHours: 3,
};

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getAttendanceThresholds = (): Promise<AttendanceThresholds> => {
  return delay({ ...thresholds });
};

export const updateAttendanceThresholds = (
  input: AttendanceThresholds,
): Promise<AttendanceThresholds> => {
  thresholds = { ...input };
  return delay({ ...thresholds });
};
