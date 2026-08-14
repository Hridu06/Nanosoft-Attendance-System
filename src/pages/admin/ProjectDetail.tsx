import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  FolderKanban,
  Plus,
  Trash2,
  Users,
  Calendar,
  Download,
  Edit2,
  Filter,
  Search,
  TrendingUp,
  UserCheck,
  BarChart3,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import { getProjects } from "../../services/projectService";
import { getEmployees } from "../../services/employeeService";
import {
  createContribution,
  deleteContribution,
  getContributionsByProject,
  updateContribution,
  type ContributionInput,
} from "../../services/contributionService";
import type { Project, ProjectStatus } from "../../types/project";
import type { Employee } from "../../types/employee";
import type { Contribution, ContributionStatus } from "../../types/attendance";

const statusStyles: Record<ProjectStatus, string> = {
  active: "bg-emerald-50 text-emerald-600",
  "on-hold": "bg-amber-50 text-amber-600",
  completed: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  "on-hold": "On Hold",
  completed: "Completed",
};

const contributionStatusStyles: Record<ContributionStatus, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  "in-progress": "bg-amber-50 text-amber-600",
  pending: "bg-slate-100 text-slate-500",
};

const contributionStatusLabels: Record<ContributionStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  pending: "Pending",
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (startTime: string, endTime: string): string => {
  const totalMinutes = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes <= 0) return "0m";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const formatDurationHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const emptyForm = (defaultEmployeeId: string): ContributionInput => ({
  employeeId: defaultEmployeeId,
  projectId: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "17:00",
  task: "",
  status: "pending",
});

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ContributionInput>(emptyForm(""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;

      const [projectList, employeeList, contributionList] = await Promise.all([
        getProjects(),
        getEmployees(),
        getContributionsByProject(projectId),
      ]);

      setProject(projectList.find((item) => item.id === projectId) ?? null);
      setEmployees(employeeList);
      setContributions(contributionList);
      setLoading(false);
    };

    load();
  }, [projectId]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const assignedEmployees = useMemo(() => {
    if (!project) return [];
    return project.employeeIds
      .map((id) => employeeMap.get(id))
      .filter((item): item is Employee => Boolean(item));
  }, [project, employeeMap]);

  // Statistics
  const stats = useMemo(() => {
    const totalContributions = contributions.length;
    const totalMinutes = contributions.reduce((total, c) => {
      const duration = toMinutes(c.endTime) - toMinutes(c.startTime);
      return total + Math.max(duration, 0);
    }, 0);

    const uniqueEmployees = new Set(contributions.map(c => c.employeeId));

    // Employee-wise summary
    const employeeSummary = new Map<string, { name: string; count: number; minutes: number }>();
    for (const c of contributions) {
      const emp = employeeMap.get(c.employeeId);
      if (!emp) continue;
      
      const existing = employeeSummary.get(c.employeeId);
      const duration = Math.max(toMinutes(c.endTime) - toMinutes(c.startTime), 0);
      
      if (existing) {
        existing.count++;
        existing.minutes += duration;
      } else {
        employeeSummary.set(c.employeeId, {
          name: emp.name,
          count: 1,
          minutes: duration,
        });
      }
    }

    return {
      totalContributions,
      totalHours: Math.round(totalMinutes / 60),
      totalMinutes,
      uniqueEmployees: uniqueEmployees.size,
      employeeSummary: Array.from(employeeSummary.entries()).map(([id, data]) => ({
        id,
        ...data,
        hours: Math.round(data.minutes / 60),
      })),
    };
  }, [contributions, employeeMap]);

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    let filtered = [...contributions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        const emp = employeeMap.get(c.employeeId);
        return emp?.name.toLowerCase().includes(term) || 
               c.task.toLowerCase().includes(term);
      });
    }

    if (filterEmployee !== "all") {
      filtered = filtered.filter(c => c.employeeId === filterEmployee);
    }

    if (filterDate) {
      filtered = filtered.filter(c => c.date === filterDate);
    }

    return filtered.sort((a, b) => a.date.localeCompare(b.date) ||
      toMinutes(a.startTime) - toMinutes(b.startTime));
  }, [contributions, searchTerm, filterEmployee, filterDate, employeeMap]);

  const openAddModal = () => {
    setError("");
    setEditingId(null);
    setForm(emptyForm(assignedEmployees[0]?.id ?? ""));
    setModalOpen(true);
  };

  const openEditModal = (contribution: Contribution) => {
    setError("");
    setEditingId(contribution.id);
    setForm({
      employeeId: contribution.employeeId,
      projectId: contribution.projectId,
      date: contribution.date,
      startTime: contribution.startTime,
      endTime: contribution.endTime,
      task: contribution.task,
      status: contribution.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!projectId) return;

    if (toMinutes(form.endTime) <= toMinutes(form.startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      if (editingId) {
        const updated = await updateContribution(editingId, { ...form, projectId });
        setContributions((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item))
        );
      } else {
        const created = await createContribution({ ...form, projectId });
        setContributions((prev) => [created, ...prev]);
      }
      
      setModalOpen(false);
    } catch (err) {
      setError("Failed to save contribution. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contribution: Contribution) => {
    const confirmed = window.confirm("Delete this contribution entry?");
    if (!confirmed) return;

    try {
      await deleteContribution(contribution.id);
      setContributions((prev) =>
        prev.filter((item) => item.id !== contribution.id),
      );
    } catch (err) {
      alert("Failed to delete contribution.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee", "Date", "Start Time", "End Time", "Duration", "Task"];
    const rows = contributions.map(c => {
      const emp = employeeMap.get(c.employeeId);
      return [
        emp?.name || "Unknown",
        c.date,
        c.startTime,
        c.endTime,
        formatDuration(c.startTime, c.endTime),
        c.task,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "project"}-contributions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/admin/projects")}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/projects")}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FolderKanban size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {project.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {project.client} · Started {project.startDate}
              </p>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
            >
              {statusLabels[project.status]}
            </span>
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              title="Export CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<Clock3 size={18} className="text-blue-500" />}
            label="Total Hours"
            value={`${stats.totalHours}h`}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<BarChart3 size={18} className="text-violet-500" />}
            label="Contributions"
            value={String(stats.totalContributions)}
            bg="bg-violet-50"
          />
          <StatCard
            icon={<Users size={18} className="text-emerald-500" />}
            label="Contributors"
            value={String(stats.uniqueEmployees)}
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-amber-500" />}
            label="Avg. Hours/Day"
            value={stats.totalContributions > 0 
              ? `${Math.round(stats.totalMinutes / stats.totalContributions / 60 * 10) / 10}h` 
              : "0h"
            }
            bg="bg-amber-50"
          />
        </div>

        {/* Assigned Employees */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assigned Employees
            </p>
            <span className="text-xs text-slate-400">
              {assignedEmployees.length} members
            </span>
          </div>

          {assignedEmployees.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No employees assigned yet.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedEmployees.map((employee) => {
                const summary = stats.employeeSummary.find(s => s.id === employee.id);
                return (
                  <div
                    key={employee.id}
                    className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm text-slate-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      {employee.name}
                      <span className="text-xs text-slate-400">
                        {" "}
                        · Manager: {employee.managerName ?? "Unassigned"}
                      </span>
                    </span>
                    {summary && (
                      <span className="text-xs text-slate-400">
                        ({summary.hours}h)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contributions */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Daily Contributions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredContributions.length} entries found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                disabled={assignedEmployees.length === 0}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={18} />
                Add Tasks
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[150px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Employees</option>
              {assignedEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {(searchTerm || filterEmployee !== "all" || filterDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterEmployee("all");
                  setFilterDate("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Task
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
              {filteredContributions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Clock3 size={22} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No contributions logged yet
                      </p>
                      <p className="text-xs text-slate-400">
                        {contributions.length > 0 ? "Try adjusting filters" : "Start by adding a contribution"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {filteredContributions.map((contribution) => (
                <tr
                  key={contribution.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {employeeMap.get(contribution.employeeId)?.name ??
                      "Unknown"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contribution.date}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {contribution.startTime} - {contribution.endTime}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {formatDuration(contribution.startTime, contribution.endTime)}
                  </td>

                  <td className="max-w-[220px] px-6 py-4 text-sm text-slate-600">
                    <p className="line-clamp-1">{contribution.task}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${contributionStatusStyles[contribution.status]}`}
                    >
                      {contributionStatusLabels[contribution.status]}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(contribution)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        aria-label="Edit contribution"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contribution)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                        aria-label="Delete contribution"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Contribution Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Tasks" : "Add Tasks"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Employee
            </label>
            <select
              required
              value={form.employeeId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, employeeId: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {assignedEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Time
              </label>
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startTime: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Time
              </label>
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endTime: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Task Details
            </label>
            <textarea
              required
              rows={3}
              value={form.task}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, task: event.target.value }))
              }
              placeholder="What was worked on?"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as ContributionStatus,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Tasks" : "Add Tasks"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  icon, 
  label, 
  value, 
  bg 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  bg: string;
}) => (
  <div className={`rounded-lg ${bg} p-3`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-slate-500">{label}</span>
    </div>
    <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
  </div>
);

export default ProjectDetail;