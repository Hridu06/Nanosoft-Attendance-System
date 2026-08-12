import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  FolderKanban,
  Plus,
  Trash2,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import { getProjects } from "../../services/projectService";
import { getEmployees } from "../../services/employeeService";
import {
  createContribution,
  deleteContribution,
  getContributionsByProject,
  type ContributionInput,
} from "../../services/contributionService";
import type { Project, ProjectStatus } from "../../types/project";
import type { Employee } from "../../types/employee";
import type { Contribution } from "../../types/attendance";

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

const emptyForm = (defaultEmployeeId: string): ContributionInput => ({
  employeeId: defaultEmployeeId,
  projectId: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "17:00",
  task: "",
});

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ContributionInput>(emptyForm(""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const openAddModal = () => {
    setError("");
    setForm(emptyForm(assignedEmployees[0]?.id ?? ""));
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

    const created = await createContribution({ ...form, projectId });
    setContributions((prev) => [created, ...prev]);

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (contribution: Contribution) => {
    const confirmed = window.confirm("Delete this contribution entry?");
    if (!confirmed) return;

    await deleteContribution(contribution.id);
    setContributions((prev) =>
      prev.filter((item) => item.id !== contribution.id),
    );
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

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        {/* Assigned Employees */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Assigned Employees
          </p>

          {assignedEmployees.length === 0 ? (
            <p className="text-sm text-slate-400">No employees assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm text-slate-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                  {employee.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contributions */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daily Contributions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Every working day, assigned employees log their contribution here —
              attendance is calculated from this data.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            disabled={assignedEmployees.length === 0}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={18} />
            Add Contribution
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
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
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {contributions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Clock3 size={22} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No contributions logged yet
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {contributions.map((contribution) => (
                <tr
                  key={contribution.id}
                  className="border-b border-slate-100 last:border-0"
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

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(contribution)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                      aria-label="Delete contribution"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contribution Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Contribution"
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

          <div className="grid grid-cols-2 gap-4">
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
              {saving ? "Saving..." : "Add Contribution"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
