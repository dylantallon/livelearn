import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  getDoc,
  doc as firestoreDoc,
  onSnapshot,
} from "firebase/firestore";

import "./LoadingScreen.css";
import MCQ from "./MCQ";
import FRQ from "./FRQ";
import Result from "./Result";
import Feedback from "./Feedback";
import FRQResult from "./FRQResult";
import FRQFeedback from "./FRQFeedback";
import Checkbox from "./CheckboxQ";
import CheckboxResult from "./CheckboxResult";
import CheckboxFeedback from "./CheckboxFeedback";
import Header from "../Components/Header";

const StudentScreen: React.FC = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState<"question" | "result" | "feedback">("question");
  const [score, setScore] = useState(0);
  const [lastUserAnswer, setLastUserAnswer] = useState<string | string[]>(``);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>("");

  const previousQuestionIndex = useRef<number>(-1);

  type Question =
  | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string; points: number }
  | { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string; points: number }
  | { type: "Checkbox"; question: string; options: string[]; answers: string[]; image?: string; points: number };

  useEffect(() => {
    const unsubscribe = onSnapshot(firestoreDoc(db, "session", "current"), async (docSnap) => {
      if (!docSnap.exists()) {
        if (sessionStarted) {
          const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
          navigate("/finished", { state: { score, total: totalPoints } });
        }
        return;
      }

      const data = docSnap.data();
      if (!data?.pollId) return;

      try {
        const pollDocSnap = await getDoc(firestoreDoc(db, "polls", data.pollId));
        if (!pollDocSnap.exists()) return;

        const pollData = pollDocSnap.data();
        const parsed: Question[] = [];

        for (const q of pollData.questions) {
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
          } else if (q.type === "checkbox") {
            parsed.push({
              type: "Checkbox",
              question: q.title,
              options: q.choices ?? [],
              answers: q.answers ?? [],
              image: q.images?.[0],
              points: q.points ?? 1,
            });
          }
        }

        setSessionStarted(true);
        setLoading(false);
        setQuestions((prev) => (prev.length === 0 ? parsed : prev));

        const currentIndex = data.questionIndex;

        // Only reset if instructor changed the question
        if (typeof currentIndex === "number" && currentIndex !== previousQuestionIndex.current) {
          previousQuestionIndex.current = currentIndex;
          setQuestionIndex(currentIndex);
          setStage("question");
          setLastUserAnswer("");
          setLastCorrectAnswer("");

          const container = document.querySelector(".main-container");
          if (container) container.scrollTop = 0;
        }

        // Sync to showAnswer flag from instructor
        if (typeof data.showAnswer === "boolean") {
          const current = parsed[data.questionIndex];
          const noAnswer =
            lastUserAnswer === "" ||
            (Array.isArray(lastUserAnswer) && lastUserAnswer.length === 0);

          if (data.showAnswer) {
            // If user didn’t answer, set the correct answer
            if (noAnswer) {
              if (current.type === "MCQ") {
                setLastCorrectAnswer(current.answer);
                setLastUserAnswer("");
              } else if (current.type === "FRQ") {
                setLastCorrectAnswer(current.acceptedAnswers.join(", "));
                setLastUserAnswer("");
              } else if (current.type === "Checkbox") {
                setLastCorrectAnswer(current.answers.join(", "));
                setLastUserAnswer([]);
              }
            }
            setStage("feedback");
          } else {
            // Only allow going back to "question" if the user hasn't submitted
            if (noAnswer) {
              setStage("question");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate, questions, score, sessionStarted, lastUserAnswer]);

  const handleAnswer = (answer: string | string[]) => {
    const current = questions[questionIndex];
    let isCorrect = false;

    setLastUserAnswer(answer);

    if (current.type === "MCQ") {
      isCorrect = answer === current.answer;
      setLastCorrectAnswer(current.answer);
    } else if (current.type === "FRQ") {
      const normalized = (answer as string).trim().toLowerCase();
      isCorrect = current.acceptedAnswers.some(
        (a: string) => a.trim().toLowerCase() === normalized
      );
      setLastCorrectAnswer(current.acceptedAnswers.join(", "));
    } else if (current.type === "Checkbox") {
      const selected = answer as string[];
      const correctSet = new Set(current.answers.map((a: string) => a.toLowerCase()));
      const normalizedSelected = selected.map((a) => a.toLowerCase());
      isCorrect =
        selected.length === correctSet.size &&
        normalizedSelected.every((a) => correctSet.has(a));
      setLastCorrectAnswer(current.answers.join(", "));
    }

    if (isCorrect) {
      setScore((prev) => prev + current.points);
    }
    
    setStage("result");
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setStage("question");
      setLastUserAnswer("");
      setLastCorrectAnswer("");
      const container = document.querySelector(".main-container");
      if (container) container.scrollTop = 0;
    } else {
      const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
      navigate("/finished", { state: { score, total: totalPoints } });
    }
  };

  const handleShowAnswer = () => setStage("feedback");

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundColor: "#2f2b2b",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "1.5rem",
          }}
        >
          <div className="spinner" />
          {!sessionStarted && (
            <div style={{ marginTop: "1rem" }}>
              Waiting for session to start...
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[questionIndex];
  if (!currentQuestion) return <div>No question found.</div>;

  if (currentQuestion.type === "MCQ") {
    if (stage === "question")
      return <MCQ question={currentQuestion} onAnswer={handleAnswer} />;
    if (stage === "result")
      return (
        <Result
          question={currentQuestion}
          userAnswer={lastUserAnswer as string}
          onShowAnswer={handleShowAnswer}
          onNext={handleNext}
        />
      );
    if (stage === "feedback")
      return (
        <Feedback
          question={currentQuestion}
          userAnswer={lastUserAnswer as string}
          correctAnswer={lastCorrectAnswer}
          onNext={handleNext}
        />
      );
  }

  if (currentQuestion.type === "FRQ") {
    if (stage === "question")
      return (
        <FRQ
          question={currentQuestion}
          onSubmit={handleAnswer}
          onShowAnswer={handleShowAnswer}
          onNext={handleNext}
        />
      );
    if (stage === "result")
      return (
        <FRQResult
          question={currentQuestion}
          userAnswer={lastUserAnswer as string}
          onNext={handleNext}
          onShowAnswer={handleShowAnswer}
        />
      );
    if (stage === "feedback")
      return (
        <FRQFeedback
          question={currentQuestion}
          userAnswer={lastUserAnswer as string}
          onNext={handleNext}
        />
      );
  }

  if (currentQuestion.type === "Checkbox") {
    if (stage === "question")
      return <Checkbox question={currentQuestion} onSubmit={handleAnswer} />;
    if (stage === "result")
      return (
        <CheckboxResult
          question={currentQuestion}
          userAnswer={lastUserAnswer as string[]}
          onShowAnswer={handleShowAnswer}
          onNext={handleNext}
        />
      );
    if (stage === "feedback")
      return (
        <CheckboxFeedback
          question={currentQuestion}
          userAnswer={lastUserAnswer as string[]}
          onNext={handleNext}
        />
      );
  }

  return <div>Invalid question type.</div>;
};

export default StudentScreen;
