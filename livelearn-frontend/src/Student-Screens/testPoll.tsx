import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type MCQQuestion = {
  type: "MCQ";
  title: string;
  choices: string[];
  answers: string[];
  images?: string[];
  points?: number;
};

type FRQQuestion = {
  type: "text";
  title: string;
  answers: string[];
  images?: string[];
  points?: number;
};

type Question = MCQQuestion | FRQQuestion;

const TestPoll = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const pollsRef = collection(db, "polls");
        const snapshot = await getDocs(pollsRef);
        const pollDocs = snapshot.docs.filter(doc => doc.id.startsWith("H"));

        if (pollDocs.length === 0) {
          console.log("No polls starting with 'H'");
          setLoading(false);
          return;
        }

        const allQuestions: Question[] = [];
        for (const docSnap of pollDocs) {
          const data = docSnap.data() as { questions: Question[] };
          if (Array.isArray(data.questions)) {
            allQuestions.push(...data.questions);
          }
        }

        setQuestions(allQuestions);
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Poll Questions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        questions.map((q, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "1.5rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <p><strong>Type:</strong> {q.type}</p>
            <p><strong>Title:</strong> {q.title}</p>
            {q.answers && <p><strong>Answers:</strong> {q.answers.join(", ")}</p>}
            {"points" in q && q.points !== undefined && <p><strong>Points:</strong> {q.points}</p>}

            {"choices" in q && q.choices?.length > 0 && (
                <div>
                    <strong>Choices:</strong>
                    <ul>
                    {q.choices.map((choice, i) => (
                        <li key={i}>
                        <strong>{String.fromCharCode(65 + i)}:</strong> {choice}
                        </li>
                    ))}
                    </ul>
                </div>
                )}

            {q.images && q.images.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                  {q.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Question ${idx} image ${i}`}
                      style={{ maxWidth: "200px", maxHeight: "150px", border: "1px solid #ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TestPoll;


