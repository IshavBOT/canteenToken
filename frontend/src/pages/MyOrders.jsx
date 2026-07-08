import { useEffect, useState } from "react";
import api from "../api";
import TokenRow from "../components/TokenRow";

const POLL_MS = 4000;

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/orders/mine");
        if (!cancelled) setOrders(res.data);
      } catch (err) {
        console.error("Failed to load my orders", err);
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="card">
      <p className="col-heading">My orders today</p>
      {orders.length === 0 && <p className="token-meta">You haven't placed an order today.</p>}
      {orders.map((o) => (
        <TokenRow key={o.id} order={o} />
      ))}
    </div>
  );
}
