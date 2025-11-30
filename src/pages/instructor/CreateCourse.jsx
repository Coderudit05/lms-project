import DashboardLayout from "../../components/layout/DashboardLayout";

function CreateCourse() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">Create New Course</h1>

        <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl">

          {/* Course Title */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Course Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter course title"
            />
          </div>

          {/* Course Description */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              rows="4"
              placeholder="Enter course description"
            ></textarea>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Category</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
              <option value="">Select category</option>
              <option value="web">Web Development</option>
              <option value="java">Java Programming</option>
              <option value="python">Python</option>
              <option value="data-science">Data Science</option>
            </select>
          </div>

          {/* Thumbnail Upload */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Thumbnail Image</label>
            <input
              type="file"
              className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer"
              accept="image/*"
            />
          </div>

          {/* Submit Button */}
          <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
            Create Course
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateCourse;
