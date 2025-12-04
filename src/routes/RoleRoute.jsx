import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protects based on: student / instructor / admin
 */
export default function RoleRoute({ children, role }) {
  const { user, profile, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // must be logged in
  if (!user) return <Navigate to="/login" replace />;

  // profile must match required role
  if (profile?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
