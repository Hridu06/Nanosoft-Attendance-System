import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  FolderKanban,
  Loader2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { getContributions } from "../../services/contributionService";
import {
  getAttendanceRecords,
  formatDuration,
} from "../../services/attendanceService";
import { getLeaveRequests } from "../../services/leaveService";
import type { Employee } from "../../types/employee";
import type { Project } from "../../types/project";
import type { AttendanceRecord, Contribution } from "../../types/attendance";
import type { LeaveRequest } from "../../types/leave";

const Dashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const [employeeData, projectData, attendanceData, contributionData, leaveData] =
        await Promise.all([
          getEmployees(),
          getProjects(),
          getAttendanceRecords(),
          getContributions(),
          getLeaveRequests(),
        ]);

      if (cancelled) return;

      setEmployees(employeeData);
      setProjects(projectData);
      setAttendanceRecords(attendanceData);
      setContributions(contributionData);
      setLeaveRequests(leaveData);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const latestDate = useMemo(() => {
    return attendanceRecords.reduce<string | null>((latest, record) => {
      if (!latest || record.date > latest) return record.date;
      return latest;
    }, null);
  }, [attendanceRecords]);

  const todaysRecords = useMemo(
    () => attendanceRecords.filter((record) => record.date === latestDate),
    [attendanceRecords, latestDate],
  );

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "active"),
    [employees],
  );

  const onLeaveToday = useMemo(() => {
    if (!latestDate) return 0;

    return leaveRequests.filter(
      (leave) =>
        leave.status === "approved" &&
        leave.startDate <= latestDate &&
        leave.endDate >= latestDate,
    ).length;
  }, [leaveRequests, latestDate]);

  const presentCount = todaysRecords.filter(
    (record) => record.status === "present",
  ).length;

  const halfDayCount = todaysRecords.filter(
    (record) => record.status === "half-day",
  ).length;

  const absentCount = Math.max(
    activeEmployees.length - todaysRecords.length - onLeaveToday,
    0,
  );

  const attendanceRate =
    activeEmployees.length > 0
      ? ((presentCount + halfDayCount) / activeEmployees.length) * 100
      : 0;

  const activeProjectsCount = projects.filter(
    (project) => project.status === "active",
  ).length;

  const workingNow = todaysRecords.filter(
    (record) => record.status !== "absent",
  );

  const recentContributions = useMemo(
    () =>
      [...contributions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [contributions],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with attendance
          {latestDate ? ` as of ${latestDate}` : ""}.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Employees"
          value={String(employees.length)}
          subtitle={`${activeEmployees.length} active employees`}
          icon={<Users size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Present Today"
          value={String(presentCount)}
          subtitle={
            activeEmployees.length > 0
              ? `${((presentCount / activeEmployees.length) * 100).toFixed(1)}% of employees`
              : "No active employees"
          }
          icon={<UserCheck size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <SummaryCard
          title="Absent Today"
          value={String(absentCount)}
          subtitle={
            activeEmployees.length > 0
              ? `${((absentCount / activeEmployees.length) * 100).toFixed(1)}% of employees`
              : "No active employees"
          }
          icon={<UserX size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />

        <SummaryCard
          title="Active Projects"
          value={String(activeProjectsCount)}
          subtitle="Currently running"
          icon={<FolderKanban size={22} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      {/* Attendance + Contribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Attendance Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Today's Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Attendance summary for the latest working day
              </p>
            </div>

            <CalendarCheck
              size={21}
              className="shrink-0 text-slate-400"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <AttendanceItem
              label="Present"
              value={String(presentCount)}
              color="bg-emerald-500"
            />

            <AttendanceItem
              label="Half Day"
              value={String(halfDayCount)}
              color="bg-amber-500"
            />

            <AttendanceItem
              label="Absent"
              value={String(absentCount)}
              color="bg-red-500"
            />

            <AttendanceItem
              label="On Leave"
              value={String(onLeaveToday)}
              color="bg-blue-500"
            />
          </div>

          {/* Simple Progress */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Attendance Rate
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {attendanceRate.toFixed(1)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(attendanceRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Working Now */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Clock3 size={21} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Working Now
              </h2>

              <p className="text-sm text-slate-500">
                Currently contributing
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-slate-900">
              {workingNow.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              employees are currently working
            </p>
          </div>

          <div className="mt-6 flex flex-wrap -space-x-2">
            {workingNow.slice(0, 5).map((record) => {
              const employee = employeeMap.get(record.employeeId);
              const initial = (employee?.name || "?").charAt(0).toUpperCase();

              return (
                <div
                  key={record.employeeId}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-semibold text-white"
                  title={employee?.name}
                >
                  {initial}
                </div>
              );
            })}

            {workingNow.length > 5 && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600">
                +{workingNow.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Contribution Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest project contributions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Task
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentContributions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-400"
                  >
                    No recent contributions.
                  </td>
                </tr>
              )}

              {recentContributions.map((contribution) => {
                const employee = employeeMap.get(contribution.employeeId);
                const project = projectMap.get(contribution.projectId);
                const [startHour, startMinute] = contribution.startTime
                  .split(":")
                  .map(Number);
                const [endHour, endMinute] = contribution.endTime
                  .split(":")
                  .map(Number);
                const durationMinutes =
                  endHour * 60 + endMinute - (startHour * 60 + startMinute);

                return (
                  <ActivityRow
                    key={contribution.id}
                    employee={employee?.name || "Unknown"}
                    initial={(employee?.name || "?").charAt(0).toUpperCase()}
                    project={project?.name || "Unknown"}
                    task={contribution.task}
                    duration={formatDuration(Math.max(durationMinutes, 0))}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
}: SummaryCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className={`shrink-0 rounded-lg p-2.5 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface AttendanceItemProps {
  label: string;
  value: string;
  color: string;
}

const AttendanceItem = ({
  label,
  value,
  color,
}: AttendanceItemProps) => {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
};

interface ActivityRowProps {
  employee: string;
  initial: string;
  project: string;
  task: string;
  duration: string;
}

const ActivityRow = ({
  employee,
  initial,
  project,
  task,
  duration,
}: ActivityRowProps) => {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
            {initial}
          </div>

          <span className="text-sm font-medium text-slate-800">
            {employee}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {project}
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">
        {task}
      </td>

      <td className="px-6 py-4 text-sm font-medium text-slate-700">
        {duration}
      </td>

      <td className="px-6 py-4">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          Active
        </span>
      </td>
    </tr>
  );
};

export default Dashboard;
