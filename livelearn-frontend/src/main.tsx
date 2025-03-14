import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import MCQ from "./Student-Screens/MCQ.tsx";
import Result from "./Student-Screens/Result.tsx";
import Feedback from "./Student-Screens/Feedback.tsx";
import Start from "./Start.tsx";
import Poll from "./Teacher-Screens/Poll.tsx";
import Score from "./Teacher-Screens/Score.tsx";
import LoadingScreen from "./Student-Screens/LoadingScreen.tsx";
import FinalScreen from "./Student-Screens/FinalScreen.tsx";
import "./index.css";

const App = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const questions = [
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "What is 3 + 5?", options: ["7", "8", "9", "10"], answer: "8" },
    { question: "What is 10 - 6?", options: ["2", "4", "5", "6"], answer: "4" },
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    navigate(`/Result?answer=${answer}`);
  };

  const handleShowAnswer = () => {
    navigate(`/FeedBack?questionIndex=${questionIndex}`);
  };

  const handleNextQuestion = () => {
    if (questionIndex < 2) {
      setQuestionIndex(questionIndex + 1);
      navigate("/MCQ");
    } else {
      navigate("/finished");
    }
  };


  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/poll" element={<Poll />} />
      <Route path="/scores" element={<Score />} />
      <Route path="/loading" element={<LoadingScreen />} />
      <Route path="/MCQ" element={<MCQ question={questions[questionIndex]} onAnswer={handleAnswer} />} />
      <Route path="/Result" element={<Result onShowAnswer={handleShowAnswer} />} />
      <Route path="/FeedBack" element={<Feedback onNext={handleNextQuestion} />} />
      <Route path="/finished" element={<FinalScreen />} />
    </Routes>
  );
};

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);

