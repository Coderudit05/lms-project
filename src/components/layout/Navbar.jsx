import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { profile, logout, authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut || authLoading) return;

    setLoggingOut(true);
    try {
      await logout(); // AuthContext handles Firebase signOut + toasts
      navigate("/login", { replace: true }); // prevent going back with browser back button
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      {/* LMS Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600">
        LMS
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* User Info */}
        <div className="text-right">
          <p className="font-semibold">{profile?.name || "Loading..."}</p>
          <p className="text-sm text-gray-600 capitalize">
            {profile?.role || "user"}
          </p>
        </div>

        {/* Profile Image Placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
