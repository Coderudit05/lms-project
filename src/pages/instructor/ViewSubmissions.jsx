// src/pages/instructor/ViewSubmissions.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";

export default function ViewSubmissions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [gradeValue, setGradeValue] = useState("");

  // Validate courseId
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is required");
      navigate("/instructor/courses");
    }
  }, [courseId, navigate]);

  // Real-time listener for submissions
  useEffect(() => {
    if (!courseId) return;

    // Query submissions for this course
    // Collection path: submissions/{courseId}/{submissionId}
    const submissionsRef = collection(db, "submissions", courseId, "items");
    
    const unsub = onSnapshot(
      submissionsRef,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSubmissions(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch submissions:", err);
        // Collection might not exist yet, that's okay
        setSubmissions([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [courseId]);

  // Handle grading
  async function handleGrade(submissionId, currentGrade) {
    setGradingId(submissionId);
    setGradeValue(currentGrade || "");
  }

  async function submitGrade() {
    if (!gradeValue.trim()) {
      toast.error("Please enter a grade");
      return;
    }

    try {
      const submissionRef = doc(db, "submissions", courseId, "items", gradingId);
      await updateDoc(submissionRef, {
        grade: gradeValue.trim(),
        gradedBy: profile.uid,
        gradedAt: new Date().toISOString(),
      });
      toast.success("Grade submitted!");
      setGradingId(null);
      setGradeValue("");
    } catch (err) {
      console.error("Grading failed:", err);
      toast.error("Failed to submit grade");
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Assignment Submissions</h1>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Course
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
          {loading ? (
            <Loader />
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions yet for this course.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Student Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">File URL</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{s.studentName || "Unknown"}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {s.studentEmail || "—"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          s.status === "submitted"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.status || "pending"}
                      </span>
                    </td>

                    <td className="p-3">
                      {s.fileURL ? (
                        <a
                          href={s.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
                    </td>

                    <td className="p-3 text-sm text-gray-600">
                      {s.submittedAt
                        ? new Date(s.submittedAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="p-3">
                      {s.grade ? (
                        <span className="font-semibold text-green-600">
                          {s.grade}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not graded</span>
                      )}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleGrade(s.id, s.grade)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Grading Modal */}
        {gradingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Submit Grade</h2>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter grade (e.g., A+, 95/100)"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={submitGrade}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setGradingId(null);
                    setGradeValue("");
                  }}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
