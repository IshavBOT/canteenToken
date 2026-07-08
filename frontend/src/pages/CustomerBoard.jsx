import { useEffect, useState } from "react";
import api from "../api";
import TokenRow from "../components/TokenRow";

const POLL_MS = 4000;

export default function CustomerBoard() {
  const [board, setBoard] = useState({ now_serving: null, preparing: [], ordered: [], prepared: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/orders/board");
        if (!cancelled) setBoard(res.data);
      } catch (err) {
        console.error("Failed to load board", err);
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
    <div>
      <div className="card hero-card">
        <p className="hero-label">Ready for pickup</p>
        <p className="hero-number blink">{board.now_serving ? `#${board.now_serving}` : "—"}</p>
      </div>

      <div className="board-grid">
        <div>
          <p className="col-heading">Currently preparing</p>
          {board.preparing.length === 0 && <p className="token-meta">Nothing in the kitchen right now.</p>}
          {board.preparing.map((o) => (
            <TokenRow key={o.id} order={o} />
          ))}
        </div>

        <div>
          <p className="col-heading">Last ordered</p>
          {board.ordered.length === 0 && <p className="token-meta">No orders waiting.</p>}
          {board.ordered.map((o) => (
            <TokenRow key={o.id} order={o} />
          ))}
        </div>

        <div>
          <p className="col-heading">Last prepared</p>
          {board.prepared.length === 0 && <p className="token-meta">Nothing prepared yet today.</p>}
          {board.prepared.map((o) => (
            <TokenRow key={o.id} order={o} faded={o.status === "collected"} />
          ))}
        </div>
      </div>
    </div>
  );
}
