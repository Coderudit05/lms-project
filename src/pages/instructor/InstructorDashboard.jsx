// src/pages/instructor/InstructorDashboard.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/ui/Loader";

export default function InstructorDashboard() {
  const { profile } = useAuth();
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If profile not loaded (or not instructor), skip
    if (!profile?.uid) {
      return;
    }

    // Query: courses created by this instructor
    // Note: Not using orderBy to avoid composite index requirement
    const q = query(
      collection(db, "courses"),
      where("createdBy", "==", profile.uid)
    );

    // Realtime listener: updates automatically on create/update/delete
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Sort by createdAt in JavaScript (newest first) and take 3
        const sorted = docs
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          })
          .slice(0, 3);
        
        setRecentCourses(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch recent courses:", err);
        setLoading(false);
      }
    );

    // cleanup listener on unmount / profile change
    return () => unsub();
  }, [profile?.uid]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-4">Instructor Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column: small stats (expand later) */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/instructor/create-course"
                className="block px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700"
              >
                Create New Course
              </Link>
              <Link
                to="/instructor/courses"
                className="block px-4 py-2 border rounded text-center hover:bg-gray-50"
              >
                View All Courses
              </Link>
            </div>
          </div>

          {/* Right column: recent courses preview */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">My Recent Courses</h3>
              <Link
                to="/instructor/courses"
                className="text-blue-600 underline"
              >
                View all courses
              </Link>
            </div>

            {loading ? (
              <Loader />
            ) : recentCourses.length === 0 ? (
              <div className="text-gray-500">
                You have not created any courses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentCourses.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-lg p-3 flex items-start justify-between"
                  >
                    <div>
                      <div className="text-lg font-semibold">{c.title}</div>
                      <div className="text-sm text-gray-600">
                        {c.category} • {c.modules?.length || 0} modules
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(c.status || "draft").toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/instructor/create-course?edit=${c.id}`}
                        className="text-sm px-2 py-1 border rounded"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/instructor/courses/${c.id}`}
                        className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional: other dashboard widgets can go below */}
      </div>
    </DashboardLayout>
  );
}
