import DashboardLayout from "../../components/layout/DashboardLayout";

function CourseDetails() {
  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Course Header */}
        <h1 className="text-3xl font-semibold mb-2">Course Title</h1>
        <p className="text-gray-600 mb-6">Instructor: John Doe</p>

        {/* Course Description */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">About this course</h2>
          <p className="text-gray-600">
            This is a sample course description. It will later show real details fetched from Firestore.
          </p>
        </div>

        {/* Course Curriculum */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>

          <ul className="space-y-3">
            <li className="p-3 bg-gray-100 rounded-md">Module 1: Introduction</li>
            <li className="p-3 bg-gray-100 rounded-md">Module 2: Basics</li>
            <li className="p-3 bg-gray-100 rounded-md">Module 3: Advanced Concepts</li>
          </ul>
        </div>

        {/* Enroll Button */}
        <button className="w-full sm:w-60 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          Enroll Now
        </button>
      </div>
    </DashboardLayout>
  );
}

export default CourseDetails;
