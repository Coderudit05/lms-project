// pages/student/WatchLecture.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function WatchLecture() {
  const { courseId } = useParams();
  const { profile } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);

  // -----------------------------
  // LOAD COURSE DATA (Modules)
  // -----------------------------
  useEffect(() => {
    async function loadCourse() {
      try {
        const courseRef = doc(db, "courses", courseId);
        const snap = await getDoc(courseRef);

        if (!snap.exists()) {
          toast.error("Course not found");
          setCourse(null);
        } else {
          const data = snap.data();
          setCourse({
            id: snap.id,
            title: data.title,
            modules: data.modules || [],
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load course");
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  // -----------------------------
  // LOAD STUDENT PROGRESS
  // -----------------------------
  useEffect(() => {
    if (!profile?.uid || !courseId) return;

    async function loadProgress() {
      try {
        const enrollRef = collection(db, "enrollments");
        const q = query(
          enrollRef,
          where("userId", "==", profile.uid),
          where("courseId", "==", courseId)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const data = snap.docs[0].data();
          setCompletedModules(data.completedModules || []);
        }
      } catch (err) {
        console.error("Progress load failed:", err);
      }
    }

    loadProgress();
  }, [profile?.uid, courseId]);

  const activeModule = course?.modules?.[activeModuleIndex] || null;

  // -----------------------------
  // MARK COMPLETE TOGGLE
  // -----------------------------
  async function handleMarkCompleted() {
    try {
      const enrollRef = collection(db, "enrollments");
      const q = query(
        enrollRef,
        where("userId", "==", profile.uid),
        where("courseId", "==", courseId)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error("You are not enrolled in this course.");
        return;
      }

      const enrollDocId = snap.docs[0].id;
      let updated = [...completedModules];

      if (updated.includes(activeModuleIndex)) {
        updated = updated.filter((i) => i !== activeModuleIndex);
        toast("Marked as not completed");
      } else {
        updated.push(activeModuleIndex);
        toast.success("Module marked as completed!");
      }

      const total = course.modules.length;
      const newProgress = Math.floor((updated.length / total) * 100);

      await updateDoc(doc(db, "enrollments", enrollDocId), {
        completedModules: updated,
        progress: newProgress,
      });

      setCompletedModules(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update progress");
    }
  }

  // -----------------------------
  // UI STARTS HERE
  // -----------------------------
  return (
    <DashboardLayout>
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading course...</p>
          </div>
        ) : !course ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Course not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: PLAYER + DETAILS */}
            <div className="lg:col-span-2">
              {/* PLAYER */}
              <div className="w-full h-64 md:h-80 lg:h-96 bg-black rounded-lg overflow-hidden mb-4">
                {activeModule?.type === "video" ? (
                  <iframe
                    src={activeModule.content}
                    title={activeModule.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-white flex items-center justify-center h-full">
                    Select a module to begin.
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {activeModule?.title || "No module selected"}
                </h2>

                <p className="text-gray-600 mb-4">
                  {activeModule?.description ||
                    "Module description will appear here."}
                </p>

                {/* BUTTON */}
                {activeModule && (
                  <button
                    onClick={handleMarkCompleted}
                    className={`px-4 py-2 rounded text-white transition ${
                      completedModules.includes(activeModuleIndex)
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {completedModules.includes(activeModuleIndex)
                      ? "Completed ✓"
                      : "Mark as Completed"}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: MODULE LIST */}
            <aside className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Course Modules</h3>

              {course.modules.length === 0 ? (
                <p className="text-gray-500">No modules added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {course.modules.map((m, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => setActiveModuleIndex(idx)}
                        className={`w-full p-3 rounded-md text-left transition ${
                          idx === activeModuleIndex
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{m.title}</span>

                          {/* SHOW COMPLETED TICK */}
                          {completedModules.includes(idx) && (
                            <span className="text-green-600 font-bold">✓</span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
