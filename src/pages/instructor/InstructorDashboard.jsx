import DashboardLayout from "../../components/layout/DashboardLayout";

function InstructorDashboard() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-4">Instructor Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Courses Created</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Students Enrolled</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">₹0</h2>
            <p className="text-gray-600">Earnings</p>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
          <p className="text-gray-500">No courses created yet.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default InstructorDashboard;
