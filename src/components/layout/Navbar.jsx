import { Link } from "react-router-dom";

function Navbar() {
  // TEMPORARY static user data for UI
  const user = {
    name: "John Doe",
    role: "instructor", // change to instructor/admin to test UI 
  };

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
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
        </div>

        {/* Profile Image Placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>

        {/* Logout Button */}
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Logout
        </button>

      </div>
    </div>
  );
}

export default Navbar;
