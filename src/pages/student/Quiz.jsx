import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

function Quiz() {
  // sample static quiz data (UI only)
  const questions = [
    {
      id: 1,
      q: "What is React?",
      options: ["A library", "A database", "A CSS framework", "A language"],
      answer: 0,
    },
    {
      id: 2,
      q: "JSX stands for?",
      options: ["JavaScript XML", "Java Simple X", "JSON eXtended", "None"],
      answer: 0,
    },
  ];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  function handleSelect(qid, idx) {
    setAnswers((s) => ({ ...s, [qid]: idx }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    let sc = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) sc += 1;
    });
    setScore(sc);
    setSubmitted(true);
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl">
        <h1 className="text-3xl font-semibold mb-4">Quiz: Basics</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {questions.map((q) => (
            <div key={q.id} className="pb-3 border-b last:border-b-0">
              <p className="font-medium mb-2">
                {q.id}. {q.q}
              </p>

              <div className="grid gap-2">
                {q.options.map((opt, idx) => {
                  const checked = answers[q.id] === idx;
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${
                        checked ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={checked || false}
                        onChange={() => handleSelect(q.id, idx)}
                        className="form-radio"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Quiz
            </button>

            {submitted && (
              <div className="text-sm text-gray-700">
                Score: <span className="font-semibold">{score}/{questions.length}</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Quiz;
