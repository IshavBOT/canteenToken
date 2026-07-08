import { useEffect, useState } from "react";
import api from "../api";
import TokenRow from "../components/TokenRow";

const POLL_MS = 4000;

function emptyLine() {
  return { menu_item_id: "", quantity: 1 };
}

export default function VendorBoard() {
  const [board, setBoard] = useState({ now_serving: null, preparing: [], ordered: [], prepared: [] });
  const [menu, setMenu] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadBoard() {
    try {
      const res = await api.get("/orders/board");
      setBoard(res.data);
    } catch (err) {
      console.error("Failed to load board", err);
    }
  }

  useEffect(() => {
    api.get("/orders/menu").then((res) => setMenu(res.data));
    loadBoard();
    const interval = setInterval(loadBoard, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    setError("");

    const items = lines
      .filter((l) => l.menu_item_id)
      .map((l) => ({ menu_item_id: Number(l.menu_item_id), quantity: Number(l.quantity) || 1 }));

    if (!employeeId || items.length === 0) {
      setError("Enter the customer's employee ID and at least one item");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/orders", { employee_id: employeeId, items });
      setEmployeeId("");
      setLines([emptyLine()]);
      await loadBoard();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create the order");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await loadBoard();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="col-heading">New order</p>
        <form onSubmit={handleCreateOrder}>
          <input placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />

          {lines.map((line, i) => (
            <div className="form-inline" key={i}>
              <select value={line.menu_item_id} onChange={(e) => updateLine(i, "menu_item_id", e.target.value)}>
                <option value="">Select item</option>
                {menu.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · Rs {m.price}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", e.target.value)}
              />
              <button type="button" className="btn btn-outline" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-outline" onClick={addLine} style={{ marginBottom: 12 }}>
            + Add item
          </button>

          {error && <p className="error-text">{error}</p>}

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Generating…" : "Generate token"}
            </button>
          </div>
        </form>
      </div>

      <div className="board-grid">
        <div>
          <p className="col-heading">Currently preparing</p>
          {board.preparing.map((o) => (
            <TokenRow key={o.id} order={o} action={<button className="btn btn-primary" onClick={() => updateStatus(o.id, "ready")}>Mark ready</button>} />
          ))}
        </div>

        <div>
          <p className="col-heading">Last ordered</p>
          {board.ordered.map((o) => (
            <TokenRow key={o.id} order={o} action={<button className="btn btn-outline" onClick={() => updateStatus(o.id, "preparing")}>Start cooking</button>} />
          ))}
        </div>

        <div>
          <p className="col-heading">Last prepared</p>
          {board.prepared.map((o) => (
            <TokenRow
              key={o.id}
              order={o}
              faded={o.status === "collected"}
              action={
                o.status === "ready" ? (
                  <button className="btn btn-primary" onClick={() => updateStatus(o.id, "collected")}>
                    Mark collected
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
