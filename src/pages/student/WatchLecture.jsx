import DashboardLayout from "../../components/layout/DashboardLayout";

function WatchLecture() {
  return (
    <DashboardLayout>
      <div className="p-4">

        {/* Title */}
        <h1 className="text-3xl font-semibold mb-4">Module 1: Introduction</h1>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-white">
            Video Player Placeholder
          </div>
        </div>

        {/* Resource Download */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Resources</h2>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Download PDF
          </button>
        </div>

        {/* Mark Complete */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            Mark Lecture as Completed
          </button>
        </div>

        {/* Next/Previous Buttons */}
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded-lg">Previous</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WatchLecture;
