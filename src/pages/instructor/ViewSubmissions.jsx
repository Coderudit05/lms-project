import DashboardLayout from "../../components/layout/DashboardLayout";

function ViewSubmissions() {
  const submissions = [
    { id: 1, name: "Rahul Sharma", status: "submitted", file: "#" },
    { id: 2, name: "Priya Verma", status: "not submitted", file: null },
    { id: 3, name: "Amit Patel", status: "submitted", file: "#" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">Assignment Submissions</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Student Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">File</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.name}</td>

                  <td className="p-3">
                    {s.status === "submitted" ? (
                      <span className="text-green-600 font-medium">Submitted</span>
                    ) : (
                      <span className="text-red-600 font-medium">Not Submitted</span>
                    )}
                  </td>

                  <td className="p-3">
                    {s.file ? (
                      <a href={s.file} className="text-blue-600 underline">
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-500">No file</span>
                    )}
                  </td>

                  <td className="p-3">
                    {s.status === "submitted" ? (
                      <button className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Grade
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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

export default ViewSubmissions;
