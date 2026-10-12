import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#6b2f52" }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role === "candidate" ? "jobseeker" : user?.role;
    const normalizedAllowed = allowedRoles.map((r) =>
      r === "candidate" ? "jobseeker" : r
    );

    if (!normalizedAllowed.includes(userRole)) {
      // Role unauthorized: redirect based on actual role
      if (userRole === "employer") return <Navigate to="/employer/dashboard" replace />;
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
