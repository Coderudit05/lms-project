import DashboardLayout from "../../components/layout/DashboardLayout";

function Profile() {
  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl">

        <h1 className="text-3xl font-semibold mb-6">Your Profile</h1>

        <div className="bg-white shadow-md rounded-lg p-6">

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full bg-gray-300 mb-3"></div>
            <button className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Change Photo
            </button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="font-medium mb-1 block">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="font-medium mb-1 block">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
              disabled
              value="student@example.com"
            />
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="font-medium mb-1 block">Role</label>
            <input
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 cursor-not-allowed"
              disabled
              value="Student"
            />
          </div>

          {/* Save Button */}
          <button className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Save Changes
          </button>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
