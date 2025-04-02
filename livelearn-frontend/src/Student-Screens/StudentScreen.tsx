// StudentScreen.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import MCQ from "./MCQ";
import FRQ from "./FRQ";
import Result from "./Result";
import Feedback from "./Feedback";
import FRQResult from "./FRQResult";
import FRQFeedback from "./FRQFeedback";

type Question =
  | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string; points: number }
  | { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string; points: number };

const StudentScreen: React.FC = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState<"question" | "result" | "feedback">("question");
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [lastUserAnswer, setLastUserAnswer] = useState<string>("");
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "polls"));
        const pollDocs = snapshot.docs.filter(doc => doc.id.startsWith("H"));

        const parsed: Question[] = [];

        for (const docSnap of pollDocs) {
          const data = docSnap.data();
          if (!Array.isArray(data.questions)) continue;

          for (const q of data.questions) {
            if (q.type === "radio") {
              parsed.push({
                type: "MCQ",
                question: q.title,
                options: q.choices ?? [],
                answer: q.answers?.[0] ?? "",
                image: q.images?.[0],
                points: q.points ?? 1,
              });
            } else if (q.type === "text") {
              parsed.push({
                type: "FRQ",
                question: q.title,
                acceptedAnswers: q.answers ?? [],
                image: q.images?.[0],
                points: q.points ?? 1,
              });
            }
          }
        }

        setQuestions(parsed);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (answer: string) => {
    const current = questions[questionIndex];
    let isCorrect = false;
  
    setLastUserAnswer(answer); // moved up front
  
    if (current.type === "MCQ") {
      isCorrect = answer === current.answer;
      setLastCorrectAnswer(current.answer);
    } else if (current.type === "FRQ") {
      isCorrect = current.acceptedAnswers.includes(answer);
      setLastCorrectAnswer(current.acceptedAnswers.join(" or "));
    }
  
    if (isCorrect) {
        setScore(prev => prev + current.points);
      }
  
    setUserAnswers([...userAnswers, answer]);
    setStage("result");
  };

  

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setStage("question"); // Always reset to question
      setLastUserAnswer("");
      setLastCorrectAnswer("");
      const container = document.querySelector(".main-container");
      if (container) container.scrollTop = 0;
    } else {
        const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
        navigate("/finished", { state: { score, total: totalPoints } });
    }
  };

  const handleShowAnswer = () => {
    setStage("feedback");
  };
  
  

  if (loading) return <div style={{ padding: "2rem" }}>Loading questions…</div>;
  const currentQuestion = questions[questionIndex];

  if (!currentQuestion) return <div>No question found.</div>;

  // Render based on question type and stage
  if (currentQuestion.type === "MCQ") {
    if (stage === "question") {
      return (
        <MCQ
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      );
    }
  
    if (stage === "result") {
      return (
        <Result
          question={currentQuestion}
          userAnswer={lastUserAnswer}
          correctAnswer={lastCorrectAnswer}
          onShowAnswer={handleShowAnswer}
          onNext={handleNext}
        />
      );
    }
  
    if (stage === "feedback") {
      return (
        <Feedback
          question={currentQuestion}
          userAnswer={lastUserAnswer}
          correctAnswer={lastCorrectAnswer}
          onNext={handleNext}
        />
      );
    }
  }
  

  if (currentQuestion.type === "FRQ") {
    if (stage === "question") {
      return (
        <FRQ
          question={currentQuestion}
          onSubmit={handleAnswer}
          onShowAnswer={handleShowAnswer}
          onNext={handleNext}
        />
      );
    }
    if (stage === "result") {
      return (
        <FRQResult
          question={currentQuestion}
          userAnswer={lastUserAnswer}
          onNext={handleNext}
          onShowAnswer={handleShowAnswer}
        />
      );
    }
    if (stage === "feedback") {
      return (
        <FRQFeedback
          question={currentQuestion}
          userAnswer={lastUserAnswer}
          onNext={handleNext}
        />
      );
    }
  }

  return <div>Invalid question type.</div>;
};

export default StudentScreen;
