// src/pages/instructor/CreateCourse.jsx
import DashboardLayout from "../../components/layout/DashboardLayout";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

import { v4 as uuidv4 } from "uuid";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // For detecting ?edit=<id>
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  // ------------------ STATES ------------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(null); // can be filename or url

  const [modules, setModules] = useState([
    { id: uuidv4(), title: "", type: "text", content: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode); // only true when editing

  // ------------------ LOAD COURSE IN EDIT MODE ------------------
  useEffect(() => {
    if (!isEditMode) return;

    async function fetchCourse() {
      try {
        const docRef = doc(db, "courses", editId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          toast.error("Course not found");
          navigate("/instructor/courses");
          return;
        }

        const data = snap.data();

        // Pre-fill fields
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCategory(data.category || "");
        setThumbnail(data.thumbnail || null);

        setModules(
          data.modules?.length
            ? data.modules
            : [{ id: uuidv4(), title: "", type: "text", content: "" }]
        );
      } catch (err) {
        console.error("Error loading course:", err);
        toast.error("Failed to load course");
      }

      setInitialLoading(false);
    }

    fetchCourse();
  }, [isEditMode, editId, navigate]);

  // ------------------ MODULE MANAGER ------------------
  function addModule() {
    setModules((prev) => [
      ...prev,
      { id: uuidv4(), title: "", type: "text", content: "" },
    ]);
  }

  function removeModule(id) {
    setModules((prev) => prev.filter((m) => m.id !== id));
  }

  function updateModule(id, key, value) {
    // Auto-convert YouTube URL to embed URL
    let finalValue = value;

    if (key === "content" && value.includes("youtube.com/watch?v=")) {
      const videoId = value.split("v=")[1].split("&")[0];
      finalValue = `https://www.youtube.com/embed/${videoId}`;
    }

    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: finalValue } : m))
    );
  }

  // ------------------ VALIDATION ------------------
  function validate() {
    if (!title.trim()) return toast.error("Course title is required"), false;
    if (!description.trim())
      return toast.error("Description is required"), false;
    if (!category.trim()) return toast.error("Category is required"), false;

    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        toast.error(`Module ${i + 1} title missing`);
        return false;
      }
      if (!modules[i].content.trim()) {
        toast.error(`Module ${i + 1} content missing`);
        return false;
      }
    }
    return true;
  }

  // ------------------ SUBMIT HANDLER ------------------
  async function handleCreate(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const toastId = toast.loading(
      isEditMode ? "Updating your course..." : "Creating your course..."
    );

    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnail: thumbnail?.trim() || null,
        modules,
        createdBy: profile.uid,
        createdByName: profile.name || profile.email,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        // 🔥 UPDATE existing course
        await updateDoc(doc(db, "courses", editId), courseData);

        toast.dismiss(toastId);
        toast.success("Course updated!");
      } else {
        // 🆕 CREATE new course
        await addDoc(collection(db, "courses"), {
          ...courseData,
          createdAt: serverTimestamp(),
          status: "draft",
          studentsEnrolled: 0,
        });

        toast.dismiss(toastId);
        toast.success("Course created!");
      }

      navigate("/instructor/dashboard");
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(
        isEditMode ? "Failed to update course" : "Failed to create course"
      );
    }

    setLoading(false);
  }

  // ------------------ UI ------------------
  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 text-gray-600">Loading course...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-3xl font-semibold mb-6">
          {isEditMode ? "Edit Course" : "Create New Course"}
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl">
          {/* Title */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows="4"
              placeholder="Enter course description"
            ></textarea>
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select category</option>
              <option value="web">Web Development</option>
              <option value="java">Java Programming</option>
              <option value="python">Python</option>
              <option value="data-science">Data Science</option>
            </select>
          </div>

          {/* Thumbnail URL */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Thumbnail URL</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
              value={thumbnail || ""}
              onChange={(e) => setThumbnail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL for the course thumbnail image
            </p>
          </div>

          {/* Modules */}
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h3 className="text-xl font-semibold mb-3">Course Modules</h3>

            {modules.map((m, idx) => (
              <div key={m.id} className="border p-3 rounded mb-3">
                <p className="font-medium mb-2">Module {idx + 1}</p>

                <input
                  type="text"
                  placeholder="Module Title"
                  value={m.title}
                  onChange={(e) => updateModule(m.id, "title", e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                />

                <select
                  value={m.type}
                  onChange={(e) => updateModule(m.id, "type", e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="video">Video URL</option>
                  <option value="pdf">PDF URL</option>
                </select>

                <textarea
                  value={m.content}
                  onChange={(e) =>
                    updateModule(m.id, "content", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                  placeholder={
                    m.type === "text"
                      ? "Enter text content..."
                      : m.type === "video"
                      ? "https://youtube.com/watch?v=..."
                      : "https://example.com/document.pdf"
                  }
                ></textarea>

                <button
                  type="button"
                  onClick={() => removeModule(m.id)}
                  className="text-red-600 mt-1 text-sm"
                >
                  Remove Module
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addModule}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              + Add Module
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
