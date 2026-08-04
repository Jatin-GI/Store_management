import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PERMISSIONS } from "../constants/permissions";

const panelClass = "bg-paper border border-line rounded-2xl p-5";
const inputClass = "w-full border border-line p-2 rounded bg-white";

const LISTER_OPTIONS = [
  PERMISSIONS.PROFILE_READ,
  PERMISSIONS.PROFILE_UPDATE,
  PERMISSIONS.PRODUCT_CREATE,
  PERMISSIONS.PRODUCT_READ,
  PERMISSIONS.PRODUCT_UPDATE,
  PERMISSIONS.PRODUCT_DELETE,
  PERMISSIONS.INVENTORY_READ,
  PERMISSIONS.INVENTORY_UPDATE,
  PERMISSIONS.CATEGORY_CREATE,
  PERMISSIONS.CATEGORY_READ,
  PERMISSIONS.CATEGORY_UPDATE,
  PERMISSIONS.CATEGORY_DELETE,
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  permissions: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.CATEGORY_READ],
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [mode, setMode] = useState(null); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/employee/get-employees");
      setEmployees(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setMode(null);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (emp) => {
    setMode("edit");
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      permissions: emp.permissions || [],
    });
  };

  const togglePermission = (permission) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.permissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        const { data } = await api.post("/employee/create", form);
        toast.success(data.message);
      } else {
        const { data } = await api.put(`/employee/update/${editingId}`, {
          name: form.name,
          email: form.email,
          permissions: form.permissions,
        });
        toast.success(data.message);
      }

      resetForm();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employee/delete/${id}`);
      toast.success("Employee deleted");
      if (editingId === id) resetForm();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 mb-1 uppercase tracking-[0.14em] text-xs text-green-dark">
            Team
          </p>
          <h1 className="m-0 font-display text-3xl text-ink">Employees</h1>
        </div>
        <button
          type="button"
          onClick={() => (mode === "create" ? resetForm() : openCreate())}
          className="bg-green text-paper px-4 py-2 rounded-lg font-semibold"
        >
          {mode === "create" ? "Close form" : "Add employee"}
        </button>
      </header>

      {mode && (
        <form className={`${panelClass} grid gap-3`} onSubmit={onSubmit}>
          <h2 className="m-0 text-xl font-bold">
            {mode === "create" ? "Create employee" : "Update employee & permissions"}
          </h2>
          <input
            className={inputClass}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            className={inputClass}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {mode === "create" && (
            <input
              type="password"
              className={inputClass}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          )}
          <fieldset className="border border-line rounded-xl p-3">
            <legend className="px-1">Permissions</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LISTER_OPTIONS.map((p) => (
                <label key={p} className="flex gap-2 items-center text-sm">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green text-paper px-4 py-2 rounded font-semibold disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create employee"
                  : "Update permissions"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded border border-line bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {employees.map((emp) => (
          <article key={emp.id} className={panelClass}>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="m-0 font-display text-lg">{emp.name}</h3>
                <p className="m-0 text-muted text-sm">{emp.email}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(emp)}
                  className="text-sm text-green-dark font-semibold"
                >
                  Edit permissions
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(emp.id)}
                  className="text-sm text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(emp.permissions || []).map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-1 rounded-full bg-[#e5efe8] text-green-dark"
                >
                  {p}
                </span>
              ))}
            </div>
          </article>
        ))}
        {employees.length === 0 && (
          <p className={panelClass}>No employees yet.</p>
        )}
      </div>
    </div>
  );
};

export default Employees;
