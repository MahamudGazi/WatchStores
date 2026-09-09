import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getAccessToken } from "../utils/storage";

export default function AdminRoute() {
  const { user } = useAuth();

  const token = getAccessToken();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User information not loaded yet
  if (!user) {
    return null;
  }

  // Customers cannot access admin area
  const allowedRoles = [
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ];

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}