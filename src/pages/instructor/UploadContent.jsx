// src/pages/instructor/UploadContent.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/ui/Loader";

export default function UploadContent() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [url, setUrl] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [deadline, setDeadline] = useState("");

  // Content list states
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // Validate courseId
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is required");
      navigate("/instructor/courses");
    }
  }, [courseId, navigate]);

  // Real-time listener for content items
  useEffect(() => {
    if (!courseId) return;

    const contentRef = collection(db, "courses", courseId, "content");
    const q = query(contentRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setContents(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch content:", err);
        toast.error("Failed to load content");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [courseId]);

  // Validation
  function validate() {
    if (!title.trim()) {
      toast.error("Content title is required");
      return false;
    }
    // Assignment does NOT require URL
    if (type !== "assignment" && !url.trim()) {
      toast.error("URL is required");
      return false;
    }

    if (!url.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return false;
    }
    return true;
  }

  // Add or update content
  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    const contentRef = collection(db, "courses", courseId, "content");

    try {
      let contentData;

      if (type === "assignment") {
        contentData = {
          title: title.trim(),
          type: "assignment",
          description: assignmentDesc,
          deadline,
          createdBy: profile.uid,
          createdAt: serverTimestamp(),
        };
      } else {
        contentData = {
          title: title.trim(),
          type,
          url: url.trim(),
          createdBy: profile.uid,
          createdAt: serverTimestamp(),
        };
      }

      await addDoc(contentRef, contentData);
      toast.success("Content added!");

      if (editingId) {
        // Update existing content
        await updateDoc(doc(db, "courses", courseId, "content", editingId), {
          ...contentData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Content updated!");
        setEditingId(null);
      } else {
        // Add new content
        await addDoc(contentRef, {
          ...contentData,
          createdAt: serverTimestamp(),
        });
        toast.success("Content added!");
      }

      // Clear form
      setTitle("");
      setType("video");
      setUrl("");
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(
        editingId ? "Failed to update content" : "Failed to add content"
      );
    }

    setSubmitting(false);
  }

  // Delete content
  async function handleDelete(contentId) {
    if (!window.confirm("Delete this content item?")) return;

    try {
      await deleteDoc(doc(db, "courses", courseId, "content", contentId));
      toast.success("Content deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete content");
    }
  }

  // Edit content - populate form
  function handleEdit(content) {
    setEditingId(content.id);
    setTitle(content.title);
    setType(content.type);
    setUrl(content.url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cancel edit
  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setType("video");
    setUrl("");
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">
            {editingId ? "Edit Course Content" : "Upload Course Content"}
          </h1>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Course
          </button>
        </div>

        {/* Content Input Form */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="mb-5">
            <label className="block font-medium mb-1">Content Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="e.g., Introduction to React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block font-medium mb-1">Content Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="block font-medium mb-1">
              {type === "video" ? "Video URL" : "PDF URL"}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder={
                type === "video"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com/document.pdf"
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ No file uploads. Enter the direct URL to the {type}.
            </p>
          </div>

          {/* Assignment Fields */}
          {type === "assignment" && (
            <div className="space-y-4 mt-4">
              {/* Assignment Description */}
              <div>
                <label className="font-medium">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Write assignment instructions"
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="font-medium">Deadline</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                ? "Update Content"
                : "Add Content"}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>

          {loading ? (
            <Loader />
          ) : contents.length === 0 ? (
            <p className="text-gray-500">No content added yet.</p>
          ) : (
            <div className="space-y-3">
              {contents.map((content, idx) => (
                <div
                  key={content.id}
                  className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {idx + 1}. {content.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            content.type === "video"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {content.type === "video" && "🎥 Video"}
                          {content.type === "pdf" && "📄 PDF"}
                          {content.type === "assignment" && "📝 Assignment"}
                        </span>
                      </div>
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 block truncate"
                      >
                        {content.url}
                      </a>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(content)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
