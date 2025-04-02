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


// import { createRoot } from "react-dom/client";
// import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// import { AuthProvider } from "./Components/AuthContext.tsx";
// import MCQ from "./Student-Screens/MCQ.tsx";
// import FRQ from "./Student-Screens/FRQ.tsx";
// import Result from "./Student-Screens/Result.tsx";
// import Feedback from "./Student-Screens/Feedback.tsx";
// import Start from "./Start.tsx";
// import Poll from "./Teacher-Screens/Poll.tsx";
// import Score from "./Teacher-Screens/Score.tsx";
// import LoadingScreen from "./Student-Screens/LoadingScreen.tsx";
// import FinalScreen from "./Student-Screens/FinalScreen.tsx";
// import FRQResult from "./Student-Screens/FRQResult.tsx";
// import Edit from "./Teacher-Screens/Edit.tsx";
// import FRQFeedback from "./Student-Screens/FRQFeedback";
// import TestPoll from "./Student-Screens/testPoll.tsx";
// import {collection, getDocs} from "firebase/firestore";
// import { db } from "./firebase"


// import "./index.css";


// const App = () => {
//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<string[]>([]);
//   const navigate = useNavigate();
  

//   type Question =
//     | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string }
//     | { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string };

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "polls"));
//         const pollDocs = snapshot.docs.filter(doc => doc.id.startsWith("H"));
  
//         const allQuestions: Question[] = [];
  
//         for (const docSnap of pollDocs) {
//           const data = docSnap.data();
  
//           if (!Array.isArray(data.questions)) continue;
  
//           for (const q of data.questions) {
//             if (q.type === "radio") {
//               allQuestions.push({
//                 type: "MCQ",
//                 question: q.title,
//                 options: q.choices ?? [],
//                 answer: q.answers?.[0] ?? "",
//                 image: q.images?.[0], // use only first image
//               });
//             } else if (q.type === "text") {
//               allQuestions.push({
//                 type: "FRQ",
//                 question: q.title,
//                 acceptedAnswers: q.answers ?? [],
//                 image: q.images?.[0],
//               });
//             }
//           }
//         }
  
//         setQuestions(allQuestions);
//       } catch (err) {
//         console.error("Failed to fetch questions:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchQuestions();
//   }, []);
//   const [score, setScore] = useState(0); 
//   const totalQuestions = questions.length;

//   const handleAnswer = (answer: string) => {
//     const currentQuestion = questions[questionIndex];
//     let correctAnswer = "";

//     if (currentQuestion.type === "MCQ") {
//       correctAnswer = currentQuestion.answer;
//       if (answer === correctAnswer) {
//         setScore(prev => prev + 1); 
//       }
//       navigate(`/Result?answer=${answer}&correctAnswer=${encodeURIComponent(correctAnswer)}&questionIndex=${questionIndex}`);
//     } 
//     else if (currentQuestion.type === "FRQ") {
//       correctAnswer = currentQuestion.acceptedAnswers.join(" or ");
//       if (currentQuestion.acceptedAnswers.includes(answer)) {
//         setScore(prev => prev + 1); 
//       }
//       navigate(
//         `/FRQResult?answer=${encodeURIComponent(answer)}&questionIndex=${questionIndex}`
//       );
//     }

//     setUserAnswers([...userAnswers, answer]);
//   };

//   const handleShowAnswer = () => {
//     navigate(`/FeedBack?questionIndex=${questionIndex}`);
//   };

//   const handleNextQuestion = () => {
//     if (questionIndex < questions.length - 1) {
//       setQuestionIndex(questionIndex + 1);
//       const nextQuestion = questions[questionIndex + 1];
//       navigate(nextQuestion.type === "MCQ" ? "/MCQ" : "/FRQ");
//     } else {
//       navigate("/finished");
//     }
//   };
// if (loading) return <div style={{ padding: "2rem" }}>Loading questions...</div>;
//   return (
//     <AuthProvider>
//       <Routes>
//         <Route path="/" element={<Start />} />
//         <Route path="/poll" element={<Poll />} />
//         <Route path="/scores" element={<Score />} />
//         <Route path="/edit" element={<Edit />} />
//         <Route
//   path="/loading"
//   element={<LoadingScreen questions={questions} />}
// />
//         <Route
//           path="/FRQResult"
//           element={
//             <FRQResult
//               question={questions[questionIndex] as {
//                 type: "FRQ";
//                 question: string;
//                 acceptedAnswers: string[];
//               }}
//               onNext={handleNextQuestion}
//             />
//           }
//         />
//         <Route
//           path="/MCQ"
//           element={
//             <MCQ
//               question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
//               onAnswer={handleAnswer}
//             />
//           }
//         />
//         <Route
//           path="/FRQ"
//           element={
//             <FRQ
//               question={questions[questionIndex] as { type: "FRQ"; question: string; acceptedAnswers: string[] }}
//               onSubmit={handleAnswer}
//             />
//           }
//         />
//        <Route
//           path="/Result"
//           element={
//           <Result
//             question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
//             onShowAnswer={handleShowAnswer}
//             onNext={handleNextQuestion}
//           />
//           }
//         />
//         <Route
//           path="/FeedBack"
//           element={
//             <Feedback
//               question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
//               onNext={handleNextQuestion}
//             />
//           }
//         />
//         <Route
//           path="/FeedBackFRQ"
//           element={
//             <FRQFeedback
//               question={questions[questionIndex] as { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string; }}
//               onNext={handleNextQuestion}
//             />
//           }
//         />
//         <Route path="/finished" element={<FinalScreen score={score} total={totalQuestions} />} />
//         <Route path="/testpoll" element={<TestPoll />} />
//       </Routes>
//     </AuthProvider>
//   );
// };

// createRoot(document.getElementById("root")!).render(
//   <Router>
//     <App />
//   </Router>
// );


