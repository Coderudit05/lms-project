// src/pages/instructor/CourseDetails.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";

export default function InstructorCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!courseId) return setLoading(false);

    const courseRef = doc(db, "courses", courseId);

    // Realtime listener — keeps UI in sync
    const unsub = onSnapshot(
      courseRef,
      (snap) => {
        if (!snap.exists()) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse({ id: snap.id, ...snap.data() });
        setLoading(false);
      },
      (err) => {
        console.error("Course fetch error:", err);
        toast.error("Failed to load course");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [courseId]);

  // Optional: guard if not owner (simple client-side check)
  useEffect(() => {
    if (!loading && course && profile && course.createdBy !== profile.uid) {
      // Not the owner — redirect to instructor courses
      toast.error("You are not authorized to view this course");
      navigate("/instructor/courses");
    }
  }, [loading, course, profile, navigate]);

  async function togglePublish() {
    if (!course) return;
    setToggling(true);
    const courseRef = doc(db, "courses", course.id);
    try {
      const newStatus = (course.status === "published") ? "draft" : "published";
      await updateDoc(courseRef, { status: newStatus });
      toast.success(`Course ${newStatus === "published" ? "published" : "set to draft"}`);
    } catch (err) {
      console.error("Publish toggle failed:", err);
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 max-w-4xl mx-auto"><Loader /></div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-4 max-w-3xl mx-auto">
          <div className="text-gray-600">Course not found.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{course.title}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {course.category} • {(course.modules?.length) || 0} modules
            </div>
            <div className="text-xs text-gray-400 mt-1">{(course.status || "draft").toUpperCase()}</div>
          </div>

          <div className="flex gap-2">
            <Link to={`/instructor/create-course?edit=${course.id}`} className="px-3 py-1 border rounded">Edit</Link>

            <button
              onClick={togglePublish}
              disabled={toggling}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {course.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {/* Description + thumbnail */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-2">Description</h2>
          <p className="text-gray-700 mb-4">{course.description}</p>

          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Thumbnail</div>
            {course.thumbnail ? (
              course.thumbnail.startsWith("http") ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="max-w-sm rounded shadow"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="text-sm text-gray-600">Thumbnail: {course.thumbnail}</div>
              )
            ) : (
              <div className="text-sm text-gray-400">No thumbnail set</div>
            )}
            <div className="text-sm text-red-500 mt-1" style={{display: 'none'}}>
              Failed to load thumbnail
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link 
              to={`/instructor/add-quiz?courseId=${course.id}`} 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              📝 Manage Quiz
            </Link>
            <Link 
              to={`/instructor/upload-content?courseId=${course.id}`} 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              📚 Manage Content
            </Link>
            <Link 
              to={`/instructor/submissions?courseId=${course.id}`} 
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              📄 View Submissions
            </Link>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Modules</h3>

          {(!course.modules || course.modules.length === 0) ? (
            <div className="text-gray-500">No modules added yet.</div>
          ) : (
            <div className="space-y-3">
              {course.modules.map((m, idx) => (
                <div key={m.id || idx} className="border p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{idx + 1}. {m.title || "Untitled module"}</div>
                      <div className="text-sm text-gray-600">{m.type}</div>
                    </div>

                    {m.type === "text" ? null : (
                      <div className="text-sm text-gray-500">
                        {/* it's just a url (we are not using storage). */}
                        {m.content ? (
                          m.content.startsWith("http") ? (
                            <a href={m.content} target="_blank" rel="noreferrer" className="underline">Open</a>
                          ) : (
                            <span>{m.content}</span>
                          )
                        ) : (
                          <span className="text-gray-400">No content URL</span>
                        )}
                      </div>
                    )}
                  </div>

                  {m.type === "text" && m.content ? (
                    <div className="mt-2 text-gray-700 whitespace-pre-wrap">{m.content}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
