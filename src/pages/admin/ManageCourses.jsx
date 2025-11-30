import DashboardLayout from "../../components/layout/DashboardLayout";

function ManageCourses() {
  const courses = [
    { id: 1, title: "React Basics", instructor: "John Doe", active: true },
    { id: 2, title: "Python Bootcamp", instructor: "Priya Verma", active: false },
    { id: 3, title: "Java Masterclass", instructor: "Amit Patel", active: true },
  ];

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">Manage Courses</h1>

        <div className="bg-white shadow-md rounded-lg p-6">

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Title</th>
                <th className="p-3">Instructor</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b">
                  <td className="p-3">{course.title}</td>
                  <td className="p-3">{course.instructor}</td>
                  <td className="p-3">
                    {course.active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      {course.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ManageCourses;
