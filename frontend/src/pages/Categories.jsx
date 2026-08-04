import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PERMISSIONS } from "../constants/permissions";
import { usePermission } from "../hooks/usePermission";
import Can from "../components/Can";

const panelClass = "bg-paper border border-line rounded-2xl p-5";
const inputClass = "w-full border border-line p-2 rounded bg-white";

const Categories = () => {
  const { can } = usePermission();
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState(null); // 'create' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/category/get-categories");
      setCategories(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setMode(null);
    setEditingId(null);
    setName("");
    setImage(null);
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setName("");
    setImage(null);
  };

  const openEdit = (cat) => {
    setMode("edit");
    setEditingId(cat.id);
    setName(cat.name);
    setImage(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const body = new FormData();
      body.append("name", name);
      if (image) body.append("image", image);

      if (mode === "create") {
        if (!image) {
          toast.error("Category image is required");
          return;
        }
        const { data } = await api.post("/category/create-category", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(data.message);
      } else {
        const { data } = await api.put(
          `/category/update-category/${editingId}`,
          body,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        toast.success(data.message);
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/category/delete-category/${id}`);
      toast.success("Category deleted");
      if (editingId === id) resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 mb-1 uppercase tracking-[0.14em] text-xs text-green-dark">
            Catalog
          </p>
          <h1 className="m-0 font-display text-3xl text-ink">Categories</h1>
        </div>
        <Can permission={PERMISSIONS.CATEGORY_CREATE}>
          <button
            type="button"
            onClick={() => (mode === "create" ? resetForm() : openCreate())}
            className="bg-green text-paper px-4 py-2 rounded-lg font-semibold"
          >
            {mode === "create" ? "Close form" : "Add category"}
          </button>
        </Can>
      </header>

      {mode && (
        <Can
          permission={
            mode === "create"
              ? PERMISSIONS.CATEGORY_CREATE
              : PERMISSIONS.CATEGORY_UPDATE
          }
        >
          <form className={`${panelClass} grid gap-3`} onSubmit={onSubmit}>
            <h2 className="m-0 text-xl font-bold">
              {mode === "create" ? "Create category" : "Update category"}
            </h2>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
            />
            <div>
              <label className="text-sm text-muted">
                {mode === "create"
                  ? "Image (required)"
                  : "New image (optional)"}
              </label>
              <input
                type="file"
                accept="image/*"
                className="block mt-1"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                required={mode === "create"}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green text-paper px-4 py-2 rounded font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : mode === "create"
                    ? "Create category"
                    : "Update category"}
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
        </Can>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <article key={cat.id} className={panelClass}>
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
            <h3 className="m-0 font-display text-lg">{cat.name}</h3>
            <div className="flex gap-3 mt-3">
              {can(PERMISSIONS.CATEGORY_UPDATE) && (
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="text-sm text-green-dark font-semibold"
                >
                  Edit
                </button>
              )}
              {can(PERMISSIONS.CATEGORY_DELETE) && (
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="text-sm text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
        {categories.length === 0 && (
          <p className={panelClass}>No categories yet.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
