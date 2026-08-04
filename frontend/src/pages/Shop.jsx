import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { addToCart } from "../store/cartSlice";

const priceOf = (variant) =>
  Number(variant.price) - Number(variant.discount || 0);

const Shop = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedVariant, setSelectedVariant] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          api.get("/product/get-products?shop=true"),
          api.get("/category/get-categories"),
        ]);
        const list = productRes.data.data || [];
        setProducts(list);
        setCategories(categoryRes.data.data || []);

        const defaults = {};
        list.forEach((p) => {
          if (p.variants?.[0]) defaults[p.id] = p.variants[0].id;
        });
        setSelectedVariant(defaults);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        activeCategory === "all" || p.category_id === activeCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const handleAdd = (product) => {
    const variant = product.variants?.find(
      (v) => v.id === selectedVariant[product.id],
    );
    if (!variant) return toast.error("Select a variant");
    if (variant.stock < 1) return toast.error("Out of stock");

    dispatch(
      addToCart({
        product_id: product.id,
        variant_id: variant.id,
        title: product.title,
        variant_name: variant.name,
        image:
          product.images?.find((i) => i.is_primary)?.image_url ||
          product.images?.[0]?.image_url ||
          "",
        unit_price: priceOf(variant),
        quantity: 1,
        stock: variant.stock,
      }),
    );
    toast.success("Added to cart");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="m-0 mb-3 text-[#9fd4b4] uppercase tracking-[0.2em] text-xs">
            New season picks
          </p>
          <h1 className="m-0 font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.05] max-w-xl">
            Shop the everyday essentials.
          </h1>
          <p className="mt-4 mb-0 text-paper/80 max-w-md text-base sm:text-lg">
            Fashion, electronics, grocery, and home — curated for your store.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Search + filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
          <div>
            <h2 className="m-0 font-display text-2xl sm:text-3xl">All products</h2>
            <p className="m-0 mt-1 text-muted text-sm">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands..."
            className="w-full lg:w-80 border border-line rounded-full px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border cursor-pointer ${
              activeCategory === "all"
                ? "bg-ink text-paper border-ink"
                : "bg-white text-ink border-line hover:border-ink"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink border-line hover:border-ink"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category showcase */}
        {activeCategory === "all" && search === "" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="relative group overflow-hidden rounded-2xl h-36 sm:h-44 border-0 p-0 cursor-pointer text-left"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 text-paper font-display text-lg">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => {
              const image =
                product.images?.find((i) => i.is_primary)?.image_url ||
                product.images?.[0]?.image_url;
              const variant = product.variants?.find(
                (v) => v.id === selectedVariant[product.id],
              );
              const price = variant ? priceOf(variant) : 0;
              const mrp = variant ? Number(variant.price) : 0;
              const hasDiscount = variant && Number(variant.discount) > 0;

              return (
                <article
                  key={product.id}
                  className="bg-white border border-line rounded-2xl overflow-hidden flex flex-col group"
                >
                  <Link
                    to={`/shop/${product.id}`}
                    className="relative block aspect-[4/5] overflow-hidden bg-[#ebe4d6]"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full grid place-items-center text-muted">
                        No image
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-green text-paper text-xs font-semibold px-2 py-1 rounded">
                        Save ₹{Number(variant.discount)}
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <p className="m-0 text-xs uppercase tracking-wide text-muted">
                      {product.brand || product.category?.name}
                    </p>
                    <Link
                      to={`/shop/${product.id}`}
                      className="no-underline text-ink"
                    >
                      <h3 className="m-0 mt-1 font-display text-xl leading-snug">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="m-0 mt-2 text-sm text-muted line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-semibold">₹{price}</span>
                      {hasDiscount && (
                        <span className="text-sm text-muted line-through">
                          ₹{mrp}
                        </span>
                      )}
                    </div>

                    <select
                      className="mt-3 w-full border border-line rounded-lg px-3 py-2 bg-[#faf8f4] text-sm"
                      value={selectedVariant[product.id] || ""}
                      onChange={(e) =>
                        setSelectedVariant((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                    >
                      {(product.variants || []).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} · ₹{priceOf(v)}
                          {v.stock < 1 ? " (sold out)" : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      disabled={!variant || variant.stock < 1}
                      className="mt-3 w-full bg-ink text-paper py-2.5 rounded-lg font-semibold cursor-pointer border-0 hover:bg-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {variant?.stock < 1 ? "Sold out" : "Add to cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-line rounded-2xl">
            <p className="m-0 font-display text-2xl">No products found</p>
            <p className="m-0 mt-2 text-muted">Try another category or search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
