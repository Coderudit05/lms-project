import DashboardLayout from "../../components/layout/DashboardLayout";
import PageWrapper from "../../components/ui/PageWrapper";

function StudentDashboard() {
  return (
    <DashboardLayout>
      <PageWrapper title="Student Dashboard">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Enrolled Courses</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0%</h2>
            <p className="text-gray-600">Overall Progress</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold">0</h2>
            <p className="text-gray-600">Certificates Earned</p>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          <p className="text-gray-500">No recent courses yet.</p>
        </div>

      </PageWrapper>
    </DashboardLayout>
  );
}

export default StudentDashboard;
