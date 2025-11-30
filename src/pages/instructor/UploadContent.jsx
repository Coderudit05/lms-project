import DashboardLayout from "../../components/layout/DashboardLayout";

function UploadContent() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">Upload Course Content</h1>

        <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl">

          {/* Module Title */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Module Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter module name"
            />
          </div>

          {/* Video Upload */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Upload Video</label>
            <input
              type="file"
              className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer"
              accept="video/*"
            />
          </div>

          {/* PDF Upload */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Upload Resource (PDF)</label>
            <input
              type="file"
              className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer"
              accept="application/pdf"
            />
          </div>

          {/* Add Button */}
          <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Add Content
          </button>

        </div>

        {/* Content List */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Added Content</h2>

          <p className="text-gray-500">No modules added yet.</p>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default UploadContent;
