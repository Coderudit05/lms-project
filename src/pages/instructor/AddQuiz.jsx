// src/pages/instructor/AddQuiz.jsx
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

export default function AddQuiz() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");

  // Form states
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  // Quiz list states
  const [quizzes, setQuizzes] = useState([]);
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

  // Real-time listener for quiz questions
  useEffect(() => {
    if (!courseId) return;

    const quizzesRef = collection(db, "courses", courseId, "quizzes");
    const q = query(quizzesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setQuizzes(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch quizzes:", err);
        toast.error("Failed to load quiz questions");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [courseId]);

  // Validation
  function validate() {
    if (!questionText.trim()) {
      toast.error("Question text is required");
      return false;
    }
    if (options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      return false;
    }
    if (correctAnswer === null) {
      toast.error("Please select the correct answer");
      return false;
    }
    return true;
  }

  // Add or update question
  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    const quizzesRef = collection(db, "courses", courseId, "quizzes");

    try {
      const questionData = {
        question: questionText.trim(),
        options: options.map((o) => o.trim()),
        correctAnswer,
        createdBy: profile.uid,
      };

      if (editingId) {
        // Update existing question
        await updateDoc(doc(db, "courses", courseId, "quizzes", editingId), {
          ...questionData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Question updated!");
        setEditingId(null);
      } else {
        // Add new question
        await addDoc(quizzesRef, {
          ...questionData,
          createdAt: serverTimestamp(),
        });
        toast.success("Question added!");
      }

      // Clear form
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(null);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(editingId ? "Failed to update question" : "Failed to add question");
    }

    setSubmitting(false);
  }

  // Delete question
  async function handleDelete(quizId) {
    if (!window.confirm("Delete this question?")) return;

    try {
      await deleteDoc(doc(db, "courses", courseId, "quizzes", quizId));
      toast.success("Question deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete question");
    }
  }

  // Edit question - populate form
  function handleEdit(quiz) {
    setEditingId(quiz.id);
    setQuestionText(quiz.question);
    setOptions(quiz.options);
    setCorrectAnswer(quiz.correctAnswer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cancel edit
  function cancelEdit() {
    setEditingId(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(null);
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">
            {editingId ? "Edit Quiz Question" : "Add Quiz Questions"}
          </h1>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Course
          </button>
        </div>

        {/* Question Input Form */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="mb-5">
            <label className="font-medium mb-1 block">Question</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="mb-5">
            <label className="font-medium mb-2 block">Options</label>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctAnswer === i}
                    onChange={() => setCorrectAnswer(i)}
                    className="w-4 h-4"
                  />

                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[i] = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the radio button to mark the correct answer
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                ? "Update Question"
                : "Add Question"}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Quiz Questions List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Questions</h2>

          {loading ? (
            <Loader />
          ) : quizzes.length === 0 ? (
            <p className="text-gray-500">No questions added yet.</p>
          ) : (
            <div className="space-y-4">
              {quizzes.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-lg">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`${
                          q.correctAnswer === idx
                            ? "text-green-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {opt}
                        {q.correctAnswer === idx && (
                          <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded">
                            ✓ Correct
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
