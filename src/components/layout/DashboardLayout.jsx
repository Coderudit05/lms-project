import Navbar from "./Navbar";
import Sidebar from "./Sidebar";


function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar (fixed) */}
      <div className="w-60 fixed left-0 top-0 h-full z-20 bg-gray-200 shadow-md">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="ml-60 flex-1 flex flex-col h-full">

        {/* Navbar (fixed top) */}
        <div className="fixed top-0 left-60 right-0 z-10">
          <Navbar />
        </div>

        {/* Scrollable Page Content */}
        <div className="mt-16 p-6 overflow-y-auto h-full">
          {children}
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;
