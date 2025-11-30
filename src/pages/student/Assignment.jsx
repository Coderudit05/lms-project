import DashboardLayout from "../../components/layout/DashboardLayout";

function Assignment() {
  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl">

        <h1 className="text-3xl font-semibold mb-4">Assignment: Module 1</h1>

        {/* Instructions */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <p className="text-gray-600">
            Submit your assignment in PDF format. The size should not exceed 10 MB.
            Ensure your name and roll number are included on the first page.
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <label className="block font-medium mb-2">Upload your assignment</label>

          <input
            type="file"
            accept=".pdf, .doc, .docx, image/*"
            className="w-full px-4 py-2 border rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500"
          />

          <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Submit Assignment
          </button>
        </div>

        {/* Status */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Submission Status</h2>
          <p className="text-gray-500">Not submitted yet.</p>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Assignment;
