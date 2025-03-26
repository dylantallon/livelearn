import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import { AuthProvider } from "./Components/AuthContext.tsx";
import MCQ from "./Student-Screens/MCQ.tsx";
import FRQ from "./Student-Screens/FRQ.tsx";
import Result from "./Student-Screens/Result.tsx";
import Feedback from "./Student-Screens/Feedback.tsx";
import Start from "./Start.tsx";
import Poll from "./Teacher-Screens/Poll.tsx";
import Score from "./Teacher-Screens/Score.tsx";
import LoadingScreen from "./Student-Screens/LoadingScreen.tsx";
import FinalScreen from "./Student-Screens/FinalScreen.tsx";
import Edit from "./Teacher-Screens/Edit.tsx";
import "./index.css";


const App = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  type Question =
    | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string;}
    | { type: "FRQ"; question: string; acceptedAnswers: string[] };

  const questions: Question[] = [
    { type: "MCQ", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4", image: "/public/unnamed.png"},
    { type: "MCQ", question: "What is 3 + 5?", options: ["7", "8", "9", "10"], answer: "8" },
    { type: "FRQ", question: "Is the sky blue?", acceptedAnswers: ["Yes", "yes", "ye"] },
  ];
  const [score, setScore] = useState(0); 
  const totalQuestions = questions.length; 

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[questionIndex];
    let correctAnswer = "";

    if (currentQuestion.type === "MCQ") {
      correctAnswer = currentQuestion.answer;
      if (answer === correctAnswer) {
        setScore(prev => prev + 1); 
      }
    } else if (currentQuestion.type === "FRQ") {
      correctAnswer = currentQuestion.acceptedAnswers.join(" or ");
      if (currentQuestion.acceptedAnswers.includes(answer)) {
        setScore(prev => prev + 1); 
      }
    }

    setUserAnswers([...userAnswers, answer]);

    navigate(`/Result?answer=${answer}&correctAnswer=${encodeURIComponent(correctAnswer)}&questionIndex=${questionIndex}`);
  };

  const handleShowAnswer = () => {
    navigate(`/FeedBack?questionIndex=${questionIndex}`);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      const nextQuestion = questions[questionIndex + 1];
      navigate(nextQuestion.type === "MCQ" ? "/MCQ" : "/FRQ");
    } else {
      navigate("/finished");
    }
  };

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/poll" element={<Poll />} />
        <Route path="/scores" element={<Score />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route
          path="/MCQ"
          element={
            <MCQ
              question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
              onAnswer={handleAnswer}
            />
          }
        />
        <Route
          path="/FRQ"
          element={
            <FRQ
              question={questions[questionIndex] as { type: "FRQ"; question: string; acceptedAnswers: string[] }}
              onSubmit={handleAnswer}
            />
          }
        />
        <Route path="/Result" element={<Result onShowAnswer={handleShowAnswer} onNext={handleNextQuestion} />} />
        <Route path="/FeedBack" element={<Feedback question={questions[questionIndex]} onNext={handleNextQuestion} />} />
        <Route path="/finished" element={<FinalScreen score={score} total={totalQuestions} />} />
      </Routes>
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
