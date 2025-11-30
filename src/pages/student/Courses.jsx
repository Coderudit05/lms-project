import DashboardLayout from "../../components/layout/DashboardLayout";

function Courses() {
  const sampleCourses = [
    { id: 1, title: "React for Beginners", instructor: "John Doe" },
    { id: 2, title: "Java Full Stack", instructor: "Alice Smith" },
    { id: 3, title: "Python Bootcamp", instructor: "David Miller" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">All Courses</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCourses.map((course) => (
            <div key={course.id} className="bg-white shadow-md rounded-lg p-5">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>

              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600 text-sm">
                Instructor: {course.instructor}
              </p>

              <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Courses;
