import {
  CalendarCheck,
  Clock3,
  FolderKanban,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with attendance today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Employees"
          value="86"
          subtitle="Active employees"
          icon={<Users size={22} />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <SummaryCard
          title="Present Today"
          value="71"
          subtitle="82.6% of employees"
          icon={<UserCheck size={22} />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <SummaryCard
          title="Absent Today"
          value="4"
          subtitle="4.7% of employees"
          icon={<UserX size={22} />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />

        <SummaryCard
          title="Active Projects"
          value="15"
          subtitle="Currently running"
          icon={<FolderKanban size={22} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      {/* Attendance + Contribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Attendance Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Today's Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Attendance summary for today
              </p>
            </div>

            <CalendarCheck
              size={21}
              className="text-slate-400"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <AttendanceItem
              label="Present"
              value="71"
              color="bg-emerald-500"
            />

            <AttendanceItem
              label="Half Day"
              value="6"
              color="bg-amber-500"
            />

            <AttendanceItem
              label="Absent"
              value="4"
              color="bg-red-500"
            />

            <AttendanceItem
              label="On Leave"
              value="5"
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
                82.6%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[82.6%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Working Now */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
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
              48
            </p>

            <p className="mt-1 text-sm text-slate-500">
              employees are currently working
            </p>
          </div>

          <div className="mt-6 flex -space-x-2">
            {["S", "R", "H", "K", "F"].map((initial, index) => (
              <div
                key={index}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-semibold text-white"
              >
                {initial}
              </div>
            ))}

            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600">
              +43
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
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
              <ActivityRow
                employee="Sabbir Hossain"
                initial="S"
                project="DSK Bangladesh"
                task="Employee Management API"
                duration="2h 30m"
              />

              <ActivityRow
                employee="Rahim Ahmed"
                initial="R"
                project="HRM System"
                task="Attendance Module"
                duration="3h 15m"
              />

              <ActivityRow
                employee="Hasan Mahmud"
                initial="H"
                project="DSK Bangladesh"
                task="UI Development"
                duration="1h 45m"
              />
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

        <div className={`rounded-lg p-2.5 ${iconBg} ${iconColor}`}>
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
        <span className={`h-2 w-2 rounded-full ${color}`} />

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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
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