import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { PERMISSIONS } from "../constants/permissions";
import { usePermission } from "../hooks/usePermission";
import Can from "../components/Can";

const panelClass = "bg-paper border border-line rounded-2xl p-5";
const inputClass = "w-full border border-line p-2 rounded bg-white";

const emptyVariant = {
  name: "",
  attributes: { color: "", size: "" },
  price: "",
  discount: 0,
  stock: 0,
};

const Products = () => {
  const { can } = usePermission();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState(null); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    brand: "",
    description: "",
    status: "draft",
  });
  const [variants, setVariants] = useState([
    { ...emptyVariant, attributes: { color: "", size: "" } },
  ]);
  const [images, setImages] = useState([]);

  const resetForm = () => {
    setMode(null);
    setEditingId(null);
    setForm({
      category_id: "",
      title: "",
      brand: "",
      description: "",
      status: "draft",
    });
    setVariants([{ ...emptyVariant, attributes: { color: "", size: "" } }]);
    setImages([]);
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/product/get-products");
      setProducts(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/category/get-categories");
      setCategories(data.data || []);
    } catch {
      /* ignore if no category:read */
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    if (field === "color" || field === "size") {
      updated[index] = {
        ...updated[index],
        attributes: { ...updated[index].attributes, [field]: value },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setVariants(updated);
  };

  const openEdit = (product) => {
    setMode("edit");
    setEditingId(product.id);
    setForm({
      category_id: product.category_id || "",
      title: product.title || "",
      brand: product.brand || "",
      description: product.description || "",
      status: product.status || "draft",
    });
    setVariants([{ ...emptyVariant, attributes: { color: "", size: "" } }]);
    setImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (mode === "edit") {
        const { data } = await api.put(`/product/update-product/${editingId}`, {
          category_id: form.category_id,
          title: form.title,
          brand: form.brand,
          description: form.description,
          status: form.status,
        });
        toast.success(data.message);
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        formData.append("variants", JSON.stringify(variants));
        images.forEach((file) => formData.append("image", file));

        const { data } = await api.post("/product/create-product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(data.message);
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/product/delete-product/${id}`);
      toast.success("Product deleted");
      if (editingId === id) resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.put(`/product/update-product/${id}`, { status });
      toast.success("Status updated");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 mb-1 uppercase tracking-[0.14em] text-xs text-green-dark">
            Catalog
          </p>
          <h1 className="m-0 font-display text-3xl text-ink">Products</h1>
        </div>
        <Can permission={PERMISSIONS.PRODUCT_CREATE}>
          <button
            type="button"
            onClick={() => (mode === "create" ? resetForm() : (setMode("create"), setEditingId(null)))}
            className="bg-green text-paper px-4 py-2 rounded-lg font-semibold"
          >
            {mode === "create" ? "Close form" : "Add product"}
          </button>
        </Can>
      </header>

      {mode && (
        <Can
          permission={
            mode === "create"
              ? PERMISSIONS.PRODUCT_CREATE
              : PERMISSIONS.PRODUCT_UPDATE
          }
        >
          <form className={`${panelClass} space-y-4`} onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold m-0">
              {mode === "create" ? "Create Product" : "Update Product"}
            </h2>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              name="title"
              placeholder="Title"
              className={inputClass}
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="brand"
              placeholder="Brand (optional)"
              className={inputClass}
              value={form.brand}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={handleChange}
              required
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {mode === "create" && (
              <>
                {variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <input
                      placeholder="Variant name"
                      className={inputClass}
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Color"
                        className={inputClass}
                        value={variant.attributes.color}
                        onChange={(e) =>
                          handleVariantChange(index, "color", e.target.value)
                        }
                      />
                      <input
                        placeholder="Size / option"
                        className={inputClass}
                        value={variant.attributes.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Price"
                        className={inputClass}
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        required
                      />
                      <input
                        type="number"
                        placeholder="Discount"
                        className={inputClass}
                        value={variant.discount}
                        onChange={(e) =>
                          handleVariantChange(index, "discount", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        className={inputClass}
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(index, "stock", e.target.value)
                        }
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 text-sm"
                        onClick={() =>
                          setVariants(variants.filter((_, i) => i !== index))
                        }
                      >
                        Remove variant
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="bg-ink text-paper px-3 py-2 rounded"
                  onClick={() =>
                    setVariants([
                      ...variants,
                      { ...emptyVariant, attributes: { color: "", size: "" } },
                    ])
                  }
                >
                  Add variant
                </button>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages([...e.target.files])}
                />
              </>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green text-paper px-5 py-2 rounded font-semibold disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : mode === "create"
                    ? "Create product"
                    : "Update product"}
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

      <div className="grid gap-4">
        {products.length === 0 && (
          <p className={panelClass}>No products yet.</p>
        )}
        {products.map((product) => {
          const image =
            product.images?.find((i) => i.is_primary)?.image_url ||
            product.images?.[0]?.image_url;
          return (
            <article
              key={product.id}
              className={`${panelClass} flex flex-col md:flex-row gap-4`}
            >
              {image ? (
                <img
                  src={image}
                  alt={product.title}
                  className="w-full md:w-36 h-36 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full md:w-36 h-36 bg-[#ebe4d6] rounded-xl grid place-items-center text-muted text-sm">
                  No image
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="m-0 font-display text-xl">{product.title}</h3>
                  <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-[#e5efe8] text-green-dark">
                    {product.status}
                  </span>
                </div>
                <p className="text-muted text-sm mt-1 mb-2">
                  {product.category?.name || "Uncategorized"}
                  {product.brand ? ` · ${product.brand}` : ""}
                </p>
                <p className="text-sm m-0 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {(product.variants || []).map((v) => (
                    <span
                      key={v.id}
                      className="px-2 py-1 rounded bg-[#ebe4d6]"
                    >
                      {v.name || "Default"} · ₹{v.price} · stock {v.stock}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {can(PERMISSIONS.PRODUCT_UPDATE) && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded bg-green/15 text-green-dark text-sm"
                        onClick={() => openEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded bg-green/15 text-green-dark text-sm"
                        onClick={() => setStatus(product.id, "active")}
                      >
                        Set active
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded bg-[#ebe4d6] text-sm"
                        onClick={() => setStatus(product.id, "draft")}
                      >
                        Set draft
                      </button>
                    </>
                  )}
                  {can(PERMISSIONS.PRODUCT_DELETE) && (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded bg-red-100 text-red-700 text-sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
