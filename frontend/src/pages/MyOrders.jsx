import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/order/my-orders");
      setOrders(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/order/cancel/${id}`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="m-0 font-display text-3xl sm:text-4xl">My orders</h1>
      <p className="mt-2 mb-8 text-muted">Track and manage your purchases</p>

      {loading ? (
        <p className="text-muted">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-line rounded-2xl">
          <p className="m-0 font-display text-2xl">No orders yet</p>
          <p className="m-0 mt-2 text-muted">
            When you place an order, it will show up here.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-5 no-underline bg-ink text-paper px-5 py-2.5 rounded-full font-semibold"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-line rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="m-0 font-display text-xl">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="m-0 mt-1 text-sm text-muted">
                    Placed {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${
                    statusStyles[order.status] || "bg-gray-100"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-line border border-line rounded-xl overflow-hidden mb-4">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 px-4 py-3 text-sm bg-[#faf8f4]"
                  >
                    <div>
                      <p className="m-0 font-medium">{item.product_title}</p>
                      <p className="m-0 text-muted">
                        {item.variant_name} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="m-0 font-semibold whitespace-nowrap">
                      ₹{item.line_total}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between gap-3 items-end">
                <div>
                  <p className="m-0 text-sm text-muted">Ship to</p>
                  <p className="m-0 text-sm max-w-md">{order.shipping_address}</p>
                </div>
                <div className="text-right">
                  <p className="m-0 text-sm text-muted">Total paid</p>
                  <p className="m-0 text-xl font-semibold">
                    ₹{order.total_amount}
                  </p>
                </div>
              </div>

              {order.status === "pending" && (
                <button
                  type="button"
                  onClick={() => cancelOrder(order.id)}
                  className="mt-4 text-sm text-red-700 bg-transparent border border-red-200 rounded-lg px-3 py-1.5 cursor-pointer"
                >
                  Cancel order
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
