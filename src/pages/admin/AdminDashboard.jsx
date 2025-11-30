import DashboardLayout from "../../components/layout/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-4">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Total Students</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Total Instructors</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Total Courses</p>
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity.</p>
        </div>

        {/* Management Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Manage Users</li>
            <li>Approve Instructors</li>
            <li>Manage Courses</li>
          </ul>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
