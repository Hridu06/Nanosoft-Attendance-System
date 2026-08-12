import { useEffect, useMemo, useState } from "react";
import { Check, Search, X, CalendarDays } from "lucide-react";
import {
  countLeaveDays,
  getLeaveRequests,
  updateLeaveStatus,
} from "../../services/leaveService";
import { getEmployees } from "../../services/employeeService";
import type { LeaveRequest, LeaveStatus, LeaveType } from "../../types/leave";
import type { Employee } from "../../types/employee";

const statusStyles: Record<LeaveStatus, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
};

const statusLabels: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const typeLabels: Record<LeaveType, string> = {
  sick: "Sick Leave",
  casual: "Casual Leave",
  annual: "Annual Leave",
  unpaid: "Unpaid Leave",
};

const Leave = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [requestList, employeeList] = await Promise.all([
        getLeaveRequests(),
        getEmployees(),
      ]);

      setRequests(requestList);
      setEmployees(employeeList);
      setLoading(false);
    };

    load();
  }, []);

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const employeeName = employeeMap.get(request.employeeId)?.name ?? "";
      const matchesSearch =
        !term || employeeName.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter, employeeMap]);

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        acc[request.status] += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 } as Record<LeaveStatus, number>,
    );
  }, [requests]);

  const handleDecision = async (id: string, status: LeaveStatus) => {
    setProcessingId(id);
    const updated = await updateLeaveStatus(id, status);
    setRequests((prev) =>
      prev.map((request) => (request.id === id ? updated : request)),
    );
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve or reject employee leave requests.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.pending}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.approved}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.rejected}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee name"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as LeaveStatus | "all")
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              )}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <CalendarDays size={22} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No leave requests found
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRequests.map((request) => {
                  const employee = employeeMap.get(request.employeeId);
                  const days = countLeaveDays(request.startDate, request.endDate);

                  return (
                    <tr
                      key={request.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                            {(employee?.name ?? "?").charAt(0).toUpperCase()}
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {employee?.name ?? "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {typeLabels[request.type]}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <p>
                          {request.startDate}
                          {request.endDate !== request.startDate
                            ? ` → ${request.endDate}`
                            : ""}
                        </p>
                        <p className="text-xs text-slate-400">
                          {days} day{days === 1 ? "" : "s"}
                        </p>
                      </td>

                      <td className="max-w-[220px] px-6 py-4 text-sm text-slate-600">
                        <p className="line-clamp-2">{request.reason}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[request.status]}`}
                        >
                          {statusLabels[request.status]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {request.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={processingId === request.id}
                              onClick={() => handleDecision(request.id, "approved")}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                              aria-label={`Approve leave for ${employee?.name}`}
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={processingId === request.id}
                              onClick={() => handleDecision(request.id, "rejected")}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label={`Reject leave for ${employee?.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="block text-right text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;
