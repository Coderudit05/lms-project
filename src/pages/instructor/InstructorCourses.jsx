// src/pages/instructor/InstructorCourses.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/ui/Loader";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function InstructorCourses() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const q = query(
      collection(db, "courses"),
      where("createdBy", "==", profile.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Sort by createdAt in JavaScript (newest first)
        const sorted = docs.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        
        setCourses(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching instructor courses:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [profile?.uid]);

  // Delete course (optional) — only the creator can delete (enforced by rules)
  async function handleDelete(courseId) {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "courses", courseId));
      toast.success("Course deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete course");
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Courses</h1>
          <Link to="/instructor/create-course" className="px-3 py-2 bg-green-600 text-white rounded">+ Create Course</Link>
        </div>

        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <div className="text-gray-600">No courses yet. Create your first course.</div>
        ) : (
          <div className="grid gap-4">
            {courses.map((c) => (
              <div key={c.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-sm text-gray-500">{c.category} • {c.modules?.length || 0} modules</div>
                  <div className="text-xs text-gray-400 mt-1">{c.status || "draft"}</div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/instructor/courses/${c.id}`} className="px-3 py-1 border rounded">View</Link>
                  <Link to={`/instructor/create-course?edit=${c.id}`} className="px-3 py-1 border rounded">Edit</Link>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
