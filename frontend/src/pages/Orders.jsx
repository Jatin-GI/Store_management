import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const panelClass = "bg-paper border border-line rounded-2xl p-5";
const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/order/all");
      setOrders(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      if (status === "cancelled") {
        await api.put(`/order/cancel/${id}`);
      } else {
        await api.put(`/order/status/${id}`, { status });
      }
      toast.success("Order updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      <header>
        <p className="m-0 mb-1 uppercase tracking-[0.14em] text-xs text-green-dark">
          Store
        </p>
        <h1 className="m-0 font-display text-3xl text-ink">Orders</h1>
      </header>

      <div className="grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className={panelClass}>
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <h3 className="m-0 font-display text-lg">
                  #{order.id.slice(0, 8)} · {order.customer?.name}
                </h3>
                <p className="m-0 text-sm text-muted">{order.customer?.email}</p>
              </div>
              <select
                className="border border-line rounded px-2 py-1 bg-white"
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <ul className="m-0 mb-2 pl-5 text-sm">
              {(order.items || []).map((item) => (
                <li key={item.id}>
                  {item.product_title} ({item.variant_name}) × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="m-0 font-semibold">₹{order.total_amount}</p>
            <p className="m-0 text-sm text-muted mt-1">{order.shipping_address}</p>
          </article>
        ))}
        {orders.length === 0 && <p className={panelClass}>No orders yet.</p>}
      </div>
    </div>
  );
};

export default Orders;
