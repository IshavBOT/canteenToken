import StatusPill from "./StatusPill";

function formatItems(items) {
  return items.map((i) => `${i.quantity}x ${i.menu_item_name}`).join(", ");
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TokenRow({ order, faded, action }) {
  return (
    <div className={`token-row ${faded ? "faded" : ""}`}>
      <div>
        <p className="token-main">
          #{order.token_number} · {formatItems(order.items)}
        </p>
        <p className="token-meta">
          {order.employee_id} · {formatTime(order.created_at)}
        </p>
      </div>
      {action ? action : <StatusPill status={order.status} />}
    </div>
  );
}
