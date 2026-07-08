import { useEffect, useState } from "react";
import api from "../api";

export default function VendorRevenue() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/revenue/today").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="token-meta">Loading…</p>;

  return (
    <div>
      <p className="token-meta" style={{ marginBottom: 12 }}>
        Today's summary · resets after midnight
      </p>

      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-label">Tokens served</p>
          <p className="metric-value">{data.tokens_served}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Items ordered</p>
          <p className="metric-value">{data.items_ordered}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Revenue today</p>
          <p className="metric-value">Rs {data.revenue.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Avg order value</p>
          <p className="metric-value">Rs {data.avg_order_value}</p>
        </div>
      </div>

      <div className="card">
        <p className="col-heading">Top items today · showing {data.top_items.length} of 20</p>
        {data.top_items.map((item, i) => (
          <div className="top-item-row" key={item.name}>
            <span>
              {i + 1}. {item.name}
            </span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
