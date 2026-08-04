import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "../store/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const checkout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Cart is empty");

    try {
      setLoading(true);
      const { data } = await api.post("/order/create", {
        shipping_address: address,
        phone,
        notes,
        items: items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      });
      toast.success(data.message);
      dispatch(clearCart());
      navigate("/my-orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="m-0 font-display text-3xl sm:text-4xl">Shopping cart</h1>
      <p className="mt-2 mb-8 text-muted">
        {items.length} item{items.length === 1 ? "" : "s"} in your bag
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-2xl">
          <p className="m-0 font-display text-2xl">Your cart is empty</p>
          <Link
            to="/shop"
            className="inline-block mt-4 no-underline bg-ink text-paper px-5 py-2.5 rounded-full font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6 items-start">
          <div className="grid gap-4">
            {items.map((item) => (
              <article
                key={item.variant_id}
                className="bg-white border border-line rounded-2xl p-4 flex gap-4"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="size-24 sm:size-28 object-cover rounded-xl"
                  />
                ) : (
                  <div className="size-24 sm:size-28 bg-[#ebe4d6] rounded-xl" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 font-display text-lg truncate">
                    {item.title}
                  </h3>
                  <p className="m-0 mt-1 text-sm text-muted">
                    {item.variant_name}
                  </p>
                  <p className="m-0 mt-2 font-semibold">₹{item.unit_price}</p>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center border border-line rounded-full overflow-hidden">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-transparent border-0 cursor-pointer"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              variant_id: item.variant_id,
                              quantity: item.quantity - 1,
                            }),
                          )
                        }
                      >
                        −
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-transparent border-0 cursor-pointer"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              variant_id: item.variant_id,
                              quantity: item.quantity + 1,
                            }),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-red-700 bg-transparent border-0 cursor-pointer"
                      onClick={() => dispatch(removeFromCart(item.variant_id))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="m-0 font-semibold whitespace-nowrap">
                  ₹{(item.unit_price * item.quantity).toFixed(0)}
                </p>
              </article>
            ))}
          </div>

          <form
            onSubmit={checkout}
            className="bg-white border border-line rounded-2xl p-5 sticky top-24 grid gap-3"
          >
            <h2 className="m-0 font-display text-xl">Order summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span>{total >= 999 ? "Free" : "₹49"}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-line pt-3">
              <span>Total</span>
              <span>₹{(total + (total >= 999 ? 0 : 49)).toFixed(2)}</span>
            </div>

            <textarea
              className="mt-2 w-full border border-line rounded-xl px-3 py-2"
              placeholder="Shipping address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
            />
            <input
              className="w-full border border-line rounded-xl px-3 py-2"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full border border-line rounded-xl px-3 py-2"
              placeholder="Order notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-green text-paper py-3 rounded-xl font-semibold border-0 cursor-pointer disabled:opacity-60"
            >
              {loading ? "Placing order..." : "Place order"}
            </button>
            <Link
              to="/shop"
              className="text-center text-sm text-muted no-underline"
            >
              Continue shopping
            </Link>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;
