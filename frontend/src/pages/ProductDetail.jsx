import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { addToCart } from "../store/cartSlice";

const priceOf = (variant) =>
  Number(variant?.price || 0) - Number(variant?.discount || 0);

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/product/get-product/${id}`);
        setProduct(data.data);
        setVariantId(data.data.variants?.[0]?.id || "");
      } catch (err) {
        toast.error(err.response?.data?.message || "Product not found");
        navigate("/shop");
      }
    };
    load();
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-muted">Loading...</div>
    );
  }

  const variant = product.variants?.find((v) => v.id === variantId);
  const images = product.images || [];
  const image = images[activeImage]?.image_url || images[0]?.image_url;

  const handleAdd = () => {
    if (!variant) return toast.error("Select a variant");
    if (variant.stock < qty) return toast.error("Not enough stock");

    dispatch(
      addToCart({
        product_id: product.id,
        variant_id: variant.id,
        title: product.title,
        variant_name: variant.name,
        image: images.find((i) => i.is_primary)?.image_url || image || "",
        unit_price: priceOf(variant),
        quantity: qty,
        stock: variant.stock,
      }),
    );
    toast.success("Added to cart");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link to="/shop" className="text-sm text-muted no-underline hover:text-ink">
        ← Back to shop
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#ebe4d6]">
            {image ? (
              <img
                src={image}
                alt={product.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full grid place-items-center text-muted">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`size-16 rounded-lg overflow-hidden border-2 p-0 cursor-pointer ${
                    activeImage === index ? "border-ink" : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-muted">
            {product.category?.name} {product.brand ? `· ${product.brand}` : ""}
          </p>
          <h1 className="m-0 mt-2 font-display text-3xl sm:text-4xl leading-tight">
            {product.title}
          </h1>
          <p className="mt-4 mb-0 text-muted leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">₹{priceOf(variant)}</span>
            {variant && Number(variant.discount) > 0 && (
              <>
                <span className="text-muted line-through">
                  ₹{Number(variant.price)}
                </span>
                <span className="text-green-dark text-sm font-semibold">
                  Save ₹{Number(variant.discount)}
                </span>
              </>
            )}
          </div>

          <p className="mt-2 mb-0 text-sm text-muted">
            {variant?.stock > 0
              ? `${variant.stock} in stock`
              : "Currently out of stock"}
          </p>

          <label className="block mt-6 text-sm font-medium">
            Choose option
            <select
              className="mt-2 w-full border border-line rounded-xl px-3 py-3 bg-white"
              value={variantId}
              onChange={(e) => {
                setVariantId(e.target.value);
                setQty(1);
              }}
            >
              {(product.variants || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — ₹{priceOf(v)}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium">Qty</span>
            <div className="inline-flex items-center border border-line rounded-full overflow-hidden bg-white">
              <button
                type="button"
                className="px-3 py-2 bg-transparent border-0 cursor-pointer"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="px-3 min-w-8 text-center">{qty}</span>
              <button
                type="button"
                className="px-3 py-2 bg-transparent border-0 cursor-pointer"
                onClick={() =>
                  setQty((q) => Math.min(variant?.stock || 1, q + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!variant || variant.stock < 1}
              className="flex-1 bg-ink text-paper py-3 rounded-xl font-semibold border-0 cursor-pointer hover:bg-green-dark disabled:opacity-50"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                handleAdd();
                navigate("/cart");
              }}
              disabled={!variant || variant.stock < 1}
              className="flex-1 bg-green text-paper py-3 rounded-xl font-semibold border-0 cursor-pointer disabled:opacity-50"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
