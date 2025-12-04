import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protects routes which need authentication
 */

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth(); // ye line ka matlab hai ki hum AuthContext se user aur authLoading ko access kar rahe hain

  // While checking login state
  // Ye condition check karti hai ki agar authLoading true hai to ek loading message dikhaya jaye
  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    );
  }

  // If user is NOT logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, allow children
  return children;
}
