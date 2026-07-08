import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(employeeId, mobile);
      } else {
        await signup(employeeId, name, mobile);
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong, please try again");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-badge" style={{ margin: "0 auto 10px" }}>
          M
        </div>
        <p style={{ fontWeight: 600, fontSize: 16, margin: 0, color: "var(--brand)" }}>Sign in to canteen board</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 18px" }}>
          Employees only · no password needed
        </p>

        <div className="toggle-row">
          <button type="button" className={`toggle-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            Log in
          </button>
          <button type="button" className={`toggle-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>
            Sign up
          </button>
        </div>

        <input placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
        {mode === "signup" && <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <input placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 40, marginTop: 8 }}>
          Continue
        </button>
      </form>
    </div>
  );
}
