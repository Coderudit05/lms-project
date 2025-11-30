import DashboardLayout from "../../components/layout/DashboardLayout";

function Progress() {
  const sampleProgress = [
    { id: 1, title: "React Basics", progress: 40 },
    { id: 2, title: "Python Bootcamp", progress: 75 },
    { id: 3, title: "Java Full Stack", progress: 10 },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 max-w-4xl">

        <h1 className="text-3xl font-semibold mb-6">Your Progress</h1>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleProgress.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>

              <p className="text-gray-700 font-medium">
                {course.progress}% Completed
              </p>

              <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Continue Learning
              </button>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Progress;
