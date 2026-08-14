import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../../services/projectService";
import { getEmployees } from "../../services/employeeService";
import type { Project, ProjectFormInput, ProjectStatus } from "../../types/project";
import type { Employee } from "../../types/employee";

const emptyForm: ProjectFormInput = {
  name: "",
  client: "",
  description: "",
  status: "active",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  progress: 0,
  employeeIds: [],
};

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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [employeeMenuOpen, setEmployeeMenuOpen] = useState(false);
  const employeeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const [projectList, employeeList] = await Promise.all([
        getProjects(),
        getEmployees(),
      ]);

      setProjects(projectList);
      setEmployees(employeeList);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!employeeMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        employeeMenuRef.current &&
        !employeeMenuRef.current.contains(event.target as Node)
      ) {
        setEmployeeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [employeeMenuOpen]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term),
    );
  }, [projects, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEmployeeMenuOpen(false);
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      client: project.client,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: project.progress,
      employeeIds: project.employeeIds,
    });
    setEmployeeMenuOpen(false);
    setModalOpen(true);
  };

  const toggleEmployee = (employeeId: string) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter((id) => id !== employeeId)
        : [...prev.employeeIds, employeeId],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    if (editingId) {
      const updated = await updateProject(editingId, form);
      setProjects((prev) =>
        prev.map((project) => (project.id === editingId ? updated : project)),
      );
    } else {
      const created = await createProject(form);
      setProjects((prev) => [created, ...prev]);
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    await deleteProject(project.id);
    setProjects((prev) => prev.filter((item) => item.id !== project.id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create projects and assign employees to them.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by project or client"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  End Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Progress
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
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading projects...
                  </td>
                </tr>
              )}

              {!loading && filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <FolderKanban size={22} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No projects found
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                          <FolderKanban size={16} />
                        </div>

                        <div>
                          <Link
                            to={`/admin/projects/${project.id}`}
                            className="text-sm font-medium text-slate-800 hover:text-blue-600 hover:underline"
                          >
                            {project.name}
                          </Link>
                          <p className="line-clamp-1 max-w-[220px] text-xs text-slate-500">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.client}
                    </td>

                    <td className="px-6 py-4">
                      {project.employeeIds.length === 0 ? (
                        <span className="text-sm text-slate-400">
                          Unassigned
                        </span>
                      ) : (
                        <div className="flex -space-x-2">
                          {project.employeeIds.slice(0, 4).map((id) => (
                            <div
                              key={id}
                              title={employeeMap.get(id)?.name}
                              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[11px] font-semibold text-white"
                            >
                              {(employeeMap.get(id)?.name ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          ))}

                          {project.employeeIds.length > 4 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold text-slate-600">
                              +{project.employeeIds.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.startDate}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.endDate || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(100, Math.max(0, project.progress))}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {project.progress}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                          aria-label={`Delete ${project.name}`}
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

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Project" : "Add Project"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Project Name
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Client
              </label>
              <input
                required
                type="text"
                value={form.client}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, client: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Date
              </label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    endDate: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editingId && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Progress ({form.progress}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.progress}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      progress: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as ProjectStatus,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="relative" ref={employeeMenuRef}>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Assign Employees
            </label>

            <button
              type="button"
              onClick={() => setEmployeeMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <span
                className={
                  form.employeeIds.length === 0 ? "text-slate-400" : undefined
                }
              >
                {form.employeeIds.length === 0
                  ? "Select employees"
                  : form.employeeIds
                      .map((id) => employeeMap.get(id)?.name)
                      .filter(Boolean)
                      .join(", ")}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-400 transition-transform ${employeeMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {employeeMenuOpen && (
              <div className="absolute z-10 mt-1.5 max-h-48 w-full space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                {employees.length === 0 && (
                  <p className="px-2 py-1.5 text-sm text-slate-400">
                    No employees available
                  </p>
                )}

                {employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={form.employeeIds.includes(employee.id)}
                      onChange={() => toggleEmployee(employee.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {employee.name}
                    <span className="text-xs text-slate-400">
                      {employee.department}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

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
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
