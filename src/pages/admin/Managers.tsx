import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, UserCog } from "lucide-react";
import Modal from "../../components/common/Modal";
import {
  createManager,
  deleteManager,
  getManagerList,
  updateManager,
} from "../../services/managerService";
import { getEmployees } from "../../services/employeeService";
import { getUserList } from "../../services/userService";
import { getDepartmentList } from "../../services/departmentService";
import type { Manager, ManagerFormInput } from "../../types/manager";
import type { ApiUser } from "../../types/auth";
import type { Department } from "../../types/department";

const emptyForm: ManagerFormInput = {
  userId: null,
  departmentId: null,
  phone: "",
  status: "active",
};

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamSizes, setTeamSizes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ManagerFormInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [managerList, employeeList, userList, departmentList] =
        await Promise.all([
          getManagerList(),
          getEmployees(),
          getUserList(),
          getDepartmentList(),
        ]);

      const counts: Record<string, number> = {};
      for (const employee of employeeList) {
        if (!employee.managerId) continue;
        counts[employee.managerId] = (counts[employee.managerId] ?? 0) + 1;
      }

      setManagers(managerList);
      setUsers(userList);
      setDepartments(departmentList);
      setTeamSizes(counts);
      setLoading(false);
    };

    load();
  }, []);

  const availableUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.id === form.userId ||
          !managers.some((manager) => manager.userId === user.id),
      ),
    [users, managers, form.userId],
  );

  const selectedUserEmail = useMemo(
    () => users.find((user) => user.id === form.userId)?.email ?? "",
    [users, form.userId],
  );

  const filteredManagers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return managers;

    return managers.filter(
      (manager) =>
        manager.name.toLowerCase().includes(term) ||
        manager.email.toLowerCase().includes(term) ||
        manager.department.toLowerCase().includes(term),
    );
  }, [managers, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (manager: Manager) => {
    setEditingId(manager.id);
    setForm({
      userId: manager.userId,
      departmentId: manager.departmentId,
      phone: manager.phone,
      status: manager.status,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        const updated = await updateManager(editingId, form);
        setManagers((prev) =>
          prev.map((manager) => (manager.id === editingId ? updated : manager)),
        );
      } else {
        const created = await createManager(form);
        setManagers((prev) => [created, ...prev]);
      }

      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save manager");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (manager: Manager) => {
    const teamSize = teamSizes[manager.id] ?? 0;

    const confirmed = window.confirm(
      teamSize > 0
        ? `${manager.name} has ${teamSize} employee(s) assigned. Delete anyway?`
        : `Delete ${manager.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    await deleteManager(manager.id);
    setManagers((prev) => prev.filter((item) => item.id !== manager.id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Managers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage manager accounts and their assigned teams.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Manager
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
          placeholder="Search by name, email or department"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Manager
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Team Size
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
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading managers...
                  </td>
                </tr>
              )}

              {!loading && filteredManagers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <UserCog size={22} className="text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No managers found
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredManagers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-semibold text-violet-600">
                          {manager.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {manager.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {manager.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {manager.department}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {teamSizes[manager.id] ?? 0} employee
                      {(teamSizes[manager.id] ?? 0) === 1 ? "" : "s"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          manager.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {manager.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(manager)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                          aria-label={`Edit ${manager.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(manager)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                          aria-label={`Delete ${manager.name}`}
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
        title={editingId ? "Edit Manager" : "Add Manager"}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <select
              required
              value={form.userId ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  userId: event.target.value ? Number(event.target.value) : null,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="" disabled>
                Select a user
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                disabled
                type="email"
                value={selectedUserEmail}
                placeholder="Select a name first"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Department
              </label>
              <select
                required
                value={form.departmentId ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    departmentId: event.target.value
                      ? Number(event.target.value)
                      : null,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
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
                    status: event.target.value as Manager["status"],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Manager"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Managers;
