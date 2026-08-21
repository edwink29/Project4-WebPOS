import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: Array<"ADMIN" | "CASHIER">;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("user_role") as
    | "ADMIN"
    | "CASHIER"
    | null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/kasir" replace />;
  }

  return <Outlet />;
};
