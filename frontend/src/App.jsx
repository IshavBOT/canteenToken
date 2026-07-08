import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import TopBar from "./components/TopBar";
import Login from "./pages/Login";
import CustomerBoard from "./pages/CustomerBoard";
import MyOrders from "./pages/MyOrders";
import VendorBoard from "./pages/VendorBoard";
import VendorRevenue from "./pages/VendorRevenue";

function RequireRole({ role, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (role && auth.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/*"
        element={
          <RequireRole>
            <div className="app-shell">
              <TopBar />
              <Routes>
                {auth?.role === "vendor" ? (
                  <>
                    <Route path="/vendor" element={<VendorBoard />} />
                    <Route path="/vendor/revenue" element={<VendorRevenue />} />
                    <Route path="*" element={<Navigate to="/vendor" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<CustomerBoard />} />
                    <Route path="/mine" element={<MyOrders />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                )}
              </Routes>
            </div>
          </RequireRole>
        }
      />
    </Routes>
  );
}
