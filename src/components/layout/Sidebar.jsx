import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdLibraryBooks, MdAssignment, MdPerson, MdAddBox, MdUpload, MdQuiz, MdGroup, MdSchool } from "react-icons/md";

function Sidebar() {
  const location = useLocation();

  // TEMP role testing
  const role = "instructor"; // change to "instructor" or "admin" to preview

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full bg-gray-200 p-4 flex flex-col">
      
      <h2 className="text-2xl font-bold mb-8 text-blue-600">LMS</h2>

      <ul className="space-y-3 text-lg">

        {/* Student Menu */}
        {role === "student" && (
          <>
            <MenuItem label="Dashboard" icon={<MdDashboard />} path="/student/dashboard" active={isActive("/student/dashboard")} />
            <MenuItem label="All Courses" icon={<MdLibraryBooks />} path="/student/courses" active={isActive("/student/courses")} />
            <MenuItem label="Progress" icon={<MdSchool />} path="/student/progress" active={isActive("/student/progress")} />
            <MenuItem label="Assignments" icon={<MdAssignment />} path="/student/assignment" active={isActive("/student/assignment")} />
            <MenuItem label="Profile" icon={<MdPerson />} path="/student/profile" active={isActive("/student/profile")} />
          </>
        )}

        {/* Instructor Menu */}
        {role === "instructor" && (
          <>
            <MenuItem label="Dashboard" icon={<MdDashboard />} path="/instructor/dashboard" active={isActive("/instructor/dashboard")} />
            <MenuItem label="Create Course" icon={<MdAddBox />} path="/instructor/create-course" active={isActive("/instructor/create-course")} />
            <MenuItem label="Upload Content" icon={<MdUpload />} path="/instructor/upload-content" active={isActive("/instructor/upload-content")} />
            <MenuItem label="Add Quiz" icon={<MdQuiz />} path="/instructor/add-quiz" active={isActive("/instructor/add-quiz")} />
            <MenuItem label="Submissions" icon={<MdAssignment />} path="/instructor/submissions" active={isActive("/instructor/submissions")} />
          </>
        )}

        {/* Admin Menu */}
        {role === "admin" && (
          <>
            <MenuItem label="Dashboard" icon={<MdDashboard />} path="/admin/dashboard" active={isActive("/admin/dashboard")} />
            <MenuItem label="Manage Users" icon={<MdGroup />} path="/admin/manage-users" active={isActive("/admin/manage-users")} />
            <MenuItem label="Manage Courses" icon={<MdLibraryBooks />} path="/admin/manage-courses" active={isActive("/admin/manage-courses")} />
          </>
        )}

      </ul>
    </div>
  );
}

function MenuItem({ label, icon, path, active }) {
  return (
    <li>
      <Link
        to={path}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-lg transition
          ${active ? "bg-blue-600 text-white font-semibold" : "hover:bg-blue-200"}
        `}
      >
        <span className="text-xl">{icon}</span>
        {label}
      </Link>
    </li>
  );
}

export default Sidebar;
