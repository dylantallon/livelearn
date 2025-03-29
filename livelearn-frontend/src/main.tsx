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
import FRQResult from "./Student-Screens/FRQResult.tsx";
import Edit from "./Teacher-Screens/Edit.tsx";
import FRQFeedback from "./Student-Screens/FRQFeedback";
import "./index.css";


const App = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  

  type Question =
    | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string }
    | { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string };

  const questions: Question[] = [
    { type: "MCQ", question: "What is the output of the code snippet?", options: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Error"], answer: "[1, 2, 3, 4]", image: "/snippet.png" },
    { type: "MCQ", question: "What do you call a blueprint for creating objects in object-oriented programming?", options: ["Abstraction", "Encapsulation", "Polymorphism", "Inheritance", "Virtual Class"], answer: "Abstraction" },
    { type: "FRQ", question: "What is the output of the code snippet?", acceptedAnswers: ["0123"], image: "/Longsnippet.png" },
    { type: "FRQ", question: "What is the OOP principle that allows an object to hide its internal data and only expose necessary parts?", acceptedAnswers: ["Encapsulation"] },
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
      navigate(`/Result?answer=${answer}&correctAnswer=${encodeURIComponent(correctAnswer)}&questionIndex=${questionIndex}`);
    } 
    else if (currentQuestion.type === "FRQ") {
      correctAnswer = currentQuestion.acceptedAnswers.join(" or ");
      if (currentQuestion.acceptedAnswers.includes(answer)) {
        setScore(prev => prev + 1); 
      }
      navigate(
        `/FRQResult?answer=${encodeURIComponent(answer)}&questionIndex=${questionIndex}`
      );
    }

    setUserAnswers([...userAnswers, answer]);
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
          path="/FRQResult"
          element={
            <FRQResult
              question={questions[questionIndex] as {
                type: "FRQ";
                question: string;
                acceptedAnswers: string[];
              }}
              onNext={handleNextQuestion}
            />
          }
        />
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
       <Route
          path="/Result"
          element={
          <Result
            question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
            onShowAnswer={handleShowAnswer}
            onNext={handleNextQuestion}
          />
          }
        />
        <Route
          path="/FeedBack"
          element={
            <Feedback
              question={questions[questionIndex] as { type: "MCQ"; question: string; options: string[]; answer: string }}
              onNext={handleNextQuestion}
            />
          }
        />
        <Route
          path="/FeedBackFRQ"
          element={
            <FRQFeedback
              question={questions[questionIndex] as { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string; }}
              onNext={handleNextQuestion}
            />
          }
        />
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
