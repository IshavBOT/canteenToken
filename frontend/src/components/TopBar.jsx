import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { auth, logout } = useAuth();

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="logo-badge">M</div>
          <div>
            <p className="brand-title">Canteen board</p>
            <p className="brand-subtitle">
              {auth?.name} · {auth?.role}
            </p>
          </div>
        </div>
        <button className="logout-link" onClick={logout}>
          Log out
        </button>
      </div>

      {auth?.role === "vendor" && (
        <div className="nav-tabs">
          <NavLink to="/vendor" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`} end>
            Token control
          </NavLink>
          <NavLink to="/vendor/revenue" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            Revenue
          </NavLink>
        </div>
      )}

      {auth?.role === "customer" && (
        <div className="nav-tabs">
          <NavLink to="/" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`} end>
            Live board
          </NavLink>
          <NavLink to="/mine" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            My orders
          </NavLink>
        </div>
      )}
    </>
  );
}
