import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getAttendanceRecords } from "../../services/attendanceService";
import { getEmployees } from "../../services/employeeService";
import type { AttendanceRecord } from "../../types/attendance";
import type { Employee } from "../../types/employee";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime12 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatHours = (totalMinutes: number): string => {
  return Number((totalMinutes / 60).toFixed(2)).toString();
};

const EmployeeAttendanceCalendar = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    const load = async () => {
      const [employeeList, recordList] = await Promise.all([
        getEmployees(),
        getAttendanceRecords(),
      ]);

      setEmployee(employeeList.find((item) => item.id === employeeId) ?? null);
      setRecords(recordList.filter((record) => record.employeeId === employeeId));
      setLoading(false);
    };

    load();
  }, [employeeId]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const record of records) map.set(record.date, record);
    return map;
  }, [records]);

  const calendarCells = useMemo(() => {
    const { year, month } = cursor;
    const firstDayWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [
      ...Array(firstDayWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [cursor]);

  const goToMonth = (direction: -1 | 1) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + direction, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const today = new Date();
  const isCurrentMonth =
    cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate("/app/attendance")}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to Attendance
      </button>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          Loading calendar...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-lg font-medium text-slate-800">
              {monthNames[cursor.month]} {cursor.year}
            </p>

            <p className="text-base font-semibold text-slate-900 sm:text-lg">
              {employee?.name ?? "Unknown Employee"}
            </p>

            <div className="flex w-fit items-center overflow-hidden rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="h-5 w-px bg-slate-300" />
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Week Day Labels */}
              <div className="grid grid-cols-7 gap-px bg-slate-200">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="bg-slate-900 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-px bg-slate-200">
                {calendarCells.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="bg-slate-50" />;
                  }

              const dateKey = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`;
              const record = recordsByDate.get(dateKey);

              const isToday =
                isCurrentMonth && day === today.getDate();

              const contributions = record?.contributions ?? [];
              const rangeLabel =
                contributions.length > 0
                  ? (() => {
                      const start = contributions.reduce((min, item) =>
                        toMinutes(item.startTime) < toMinutes(min.startTime) ? item : min,
                      );
                      const end = contributions.reduce((max, item) =>
                        toMinutes(item.endTime) > toMinutes(max.endTime) ? item : max,
                      );
                      return `${formatTime12(start.startTime)} - ${formatTime12(end.endTime)}`;
                    })()
                  : null;

              return (
                <div
                  key={dateKey}
                  className={`flex min-h-[92px] flex-col items-center justify-center gap-1 px-2 py-3 text-center ${
                    record ? "bg-green-200" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isToday ? "text-emerald-700" : "text-slate-800"
                    }`}
                  >
                    {day}
                  </p>

                  {rangeLabel && (
                    <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                      {rangeLabel}
                    </span>
                  )}

                  <p className="text-xs text-slate-600">
                    Total hr : {record ? formatHours(record.totalMinutes) : 0}
                  </p>
                </div>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceCalendar;
