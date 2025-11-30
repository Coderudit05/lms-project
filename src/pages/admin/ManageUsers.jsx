import DashboardLayout from "../../components/layout/DashboardLayout";

function ManageUsers() {
  const users = [
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", role: "student" },
    { id: 2, name: "Priya Verma", email: "priya@gmail.com", role: "instructor_pending" },
    { id: 3, name: "Amit Patel", email: "amit@gmail.com", role: "instructor" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">Manage Users</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role.replace("_", " ")}</td>
                  <td className="p-3">
                    {u.role === "instructor_pending" ? (
                      <button className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        Approve
                      </button>
                    ) : (
                      <span className="text-gray-500">—</span>
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

export default ManageUsers;
