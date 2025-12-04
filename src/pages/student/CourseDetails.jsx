// pages/student/CourseDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // UI state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Load course details
  useEffect(() => {
    if (!courseId) return;
    let mounted = true;

    async function loadCourse() {
      setLoading(true);
      try {
        const courseRef = doc(db, "courses", courseId);
        const snap = await getDoc(courseRef);

        if (!snap.exists()) {
          toast.error("Course not found");
          if (mounted) setCourse(null);
        } else {
          const data = snap.data();
          const normalized = {
            id: snap.id,
            title: data.title || "Untitled Course",
            description: data.description || "",
            createdByName: data.createdByName || "Instructor",
            category: data.category || "",
            thumbnail: data.thumbnail || "",
            modules: data.modules || [],
          };
          if (mounted) setCourse(normalized);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        toast.error("Failed to load course");
        if (mounted) setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  // Check if user is enrolled
  useEffect(() => {
    if (!profile?.uid || !courseId) return;

    const enrollmentsRef = collection(db, "enrollments");
    const q = query(
      enrollmentsRef,
      where("userId", "==", profile.uid),
      where("courseId", "==", courseId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => setIsEnrolled(!snap.empty),
      (err) => console.error("Enrollment listener error:", err)
    );

    return () => unsub();
  }, [profile?.uid, courseId]);

  // Enroll handler
  async function handleEnroll() {
    if (!profile?.uid) {
      toast.error("Please login to enroll");
      return;
    }
    if (isEnrolled) {
      toast.info("Already enrolled");
      return;
    }

    try {
      setEnrolling(true);
      await addDoc(collection(db, "enrollments"), {
        userId: profile.uid,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedModules: [],
      });
      toast.success("Successfully enrolled!");
    } catch (err) {
      console.error("Enroll failed:", err);
      toast.error("Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  }

  // Open watch lecture page (you'll update later)
  function goToCourse() {
    navigate(`/student/watch/${courseId}`);
  }

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
          <>
            {/* ---------- TOP SECTION: IMAGE + DETAILS ---------- */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT SIDE - IMAGE */}
                <div>
                  <img
                    src={
                      course.thumbnail ||
                      "https://via.placeholder.com/400x250?text=Course+Thumbnail"
                    }
                    alt="Course Thumbnail"
                    className="w-full h-56 object-cover rounded-lg shadow"
                  />
                </div>

                {/* RIGHT SIDE - DETAILS */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>

                    <p className="text-gray-500 text-sm mb-3">
                      By{" "}
                      <span className="font-semibold">
                        {course.createdByName}
                      </span>
                    </p>

                    <p className="text-gray-600 mb-4">{course.description}</p>

                    {/* Show price only when NOT enrolled */}
                    {!isEnrolled && (
                      <p className="text-xl font-semibold text-green-600 mb-2">
                        ₹999{" "}
                        <span className="text-sm text-gray-500">
                          (Dummy Price)
                        </span>
                      </p>
                    )}
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    {isEnrolled ? (
                      <>
                        <button
                          onClick={goToCourse}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full md:w-auto"
                        >
                          Go to Course
                        </button>

                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          Enrolled ✓
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full md:w-auto"
                      >
                        {enrolling ? "Enrolling..." : "Enroll Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- CURRICULUM SECTION ---------- */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>

              <ul className="space-y-3">
                {course.modules.length === 0 ? (
                  <li className="p-3 bg-gray-100 rounded-md">
                    No modules yet.
                  </li>
                ) : (
                  course.modules.map((m, idx) => (
                    <li
                      key={m.id || idx}
                      className="p-3 bg-gray-100 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <span>{m.title || `Module ${idx + 1}`}</span>
                        {m.duration && (
                          <span className="text-sm text-gray-500">
                            {m.duration}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
