import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

function AddQuiz() {
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(null);

  function addQuestion() {
    if (!qText || correct === null || options.some((opt) => opt === "")) {
      alert("Fill all fields");
      return;
    }

    const newQuestion = {
      id: questions.length + 1,
      question: qText,
      options: [...options],
      correct,
    };

    setQuestions([...questions, newQuestion]);

    // clear fields
    setQText("");
    setOptions(["", "", "", ""]);
    setCorrect(null);
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6">Add Quiz Questions</h1>

        {/* Question Input */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">

          <div className="mb-5">
            <label className="font-medium mb-1 block">Question</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
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
                    checked={correct === i}
                    onChange={() => setCorrect(i)}
                  />

                  <input
                    type="text"
                    className="w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpt = [...options];
                      newOpt[i] = e.target.value;
                      setOptions(newOpt);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add Question Button */}
          <button
            onClick={addQuestion}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Add Question
          </button>
        </div>

        {/* Quiz Preview */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Added Questions</h2>

          {questions.length === 0 ? (
            <p className="text-gray-500">No questions added yet.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q) => (
                <li key={q.id} className="p-4 border rounded-lg bg-gray-50">
                  <p className="font-medium">{q.id}. {q.question}</p>

                  <ul className="list-disc pl-6 mt-2">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`${
                          q.correct === idx ? "text-green-600 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default AddQuiz;
