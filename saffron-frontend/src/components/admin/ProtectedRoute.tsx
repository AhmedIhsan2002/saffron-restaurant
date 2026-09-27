import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}