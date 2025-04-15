import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  getDoc,
  doc as firestoreDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import { AuthContext } from "../Components/AuthContext";

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

const FinalScreenWrapper: React.FC<{ score: number; total: number }> = ({ score, total }) => {
  return (
    <div className="loading-container">
      <Header />
      <div className="default2">
        <svg width="600" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2zm0 20h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#6366F1" />
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2z" fill="#6366F1" />
          <path d="M6 22h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#FBBF24" />
        </svg>
        <p className="default3" style={{ fontSize: '3rem' }}>
          Your Score: {score} / {total}
        </p>
      </div>
    </div>
  );
};

const StudentScreen: React.FC = () => {
  const { courseId, user } = useContext(AuthContext);
  const location = useLocation();
  const isDisplay = location.pathname === "/display";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState<"question" | "result" | "feedback">("question");
  const [questionScores, setQuestionScores] = useState<number[]>([]);
  const [lastUserAnswer, setLastUserAnswer] = useState<string | string[]>(``);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>("");
  const [finalScore, setFinalScore] = useState({ score: 0, total: 0 });

  const previousQuestionIndex = useRef<number>(-1);
  const lastPollId = useRef<string | null>(null);

  type Question =
    | { type: "MCQ"; question: string; options: string[]; answer: string; image?: string; points: number }
    | { type: "FRQ"; question: string; acceptedAnswers: string[]; image?: string; points: number }
    | { type: "Checkbox"; question: string; options: string[]; answers: string[]; image?: string; points: number };

  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = onSnapshot(firestoreDoc(db, "session", courseId), async (docSnap) => {
      if (!docSnap.exists()) {
        if (sessionStarted) {
          const updatedScores = [...questionScores];
          while (updatedScores.length < questions.length) {
            updatedScores.push(0);
          }
          const totalScore = updatedScores.reduce((sum, val) => sum + (val || 0), 0);
          const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
          setFinalScore({ score: totalScore, total: totalPoints });
          setSessionEnded(true);
          lastPollId.current = null;
        }
        return;
      }

      const data = docSnap.data();
      if (!data?.pollId) return;

      if (sessionEnded && data.pollId !== lastPollId.current) {
        setSessionEnded(false);
        setLoading(true);
        setQuestionScores([]);
        setLastUserAnswer("");
        setLastCorrectAnswer("");
        setQuestionIndex(0);
        setStage("question");
      }

      lastPollId.current = data.pollId;

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
        setQuestions((prev) => {
          const alreadySet =
            prev.length === parsed.length &&
            prev.every((q, i) => JSON.stringify(q) === JSON.stringify(parsed[i]));
          return alreadySet ? prev : parsed;
        });

        if (!isDisplay && user?.uid) {
          const sessionRef = firestoreDoc(db, "session", courseId);
          await updateDoc(sessionRef, {
            activeUsers: arrayUnion(user.uid),
          });
        }

        const currentIndex = data.questionIndex;
        if (typeof currentIndex === "number" && currentIndex !== previousQuestionIndex.current) {
          previousQuestionIndex.current = currentIndex;
          setQuestionIndex(currentIndex);
          setStage("question");
          setLastUserAnswer("");
          setLastCorrectAnswer("");
          const container = document.querySelector(".main-container");
          if (container) container.scrollTop = 0;
        }

        if (typeof data.showAnswer === "boolean") {
          const current = parsed[data.questionIndex];
          const noAnswer =
            lastUserAnswer === "" ||
            (Array.isArray(lastUserAnswer) && lastUserAnswer.length === 0);

          if (data.showAnswer) {
            if (current) {
              if (current.type === "MCQ") {
                setLastCorrectAnswer(current.answer);
              } else if (current.type === "FRQ") {
                setLastCorrectAnswer(current.acceptedAnswers.join(", "));
              } else if (current.type === "Checkbox") {
                setLastCorrectAnswer(current.answers.join(", "));
              }

              if (noAnswer) {
                if (current.type === "MCQ") setLastUserAnswer("");
                else if (current.type === "FRQ") setLastUserAnswer("");
                else if (current.type === "Checkbox") setLastUserAnswer([]);

                setQuestionScores((prev) => {
                  const updated = [...prev];
                  while (updated.length <= data.questionIndex) updated.push(0);
                  updated[data.questionIndex] = 0;
                  return updated;
                });
              }
            }

            setStage("feedback");
          } else {
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
  }, [questions, sessionStarted, lastUserAnswer, courseId, questionScores, sessionEnded, user]);

  const handleAnswer = async (answer: string | string[]) => {
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

    setQuestionScores((prev) => {
      const updated = [...prev];
      updated[questionIndex] = isCorrect ? current.points : 0;
      return updated;
    });

    if (user?.uid) {
      const sessionRef = firestoreDoc(db, "session", courseId);
      await updateDoc(sessionRef, {
        userAnswered: arrayUnion(user.uid),
      });
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
      const updatedScores = [...questionScores];
      while (updatedScores.length < questions.length) {
        updatedScores.push(0);
      }

      const totalScore = updatedScores.reduce((sum, val) => sum + (val || 0), 0);
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      setFinalScore({ score: totalScore, total: totalPoints });
      setSessionEnded(true);
    }
  };

  const handleShowAnswer = () => setStage("feedback");

  if (sessionEnded) {
    if (isDisplay) {
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
              <div style={{fontSize: "3rem"}}>Session Ended...</div>
            </div>
          </div>
      );
    }
    return <FinalScreenWrapper score={finalScore.score} total={finalScore.total} />;
  }

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
    if (stage === "feedback") {
      return (
        <Feedback
          question={currentQuestion}
          userAnswer={lastUserAnswer as string}
          correctAnswer={lastCorrectAnswer || currentQuestion.answer}
          onNext={handleNext}
        />
      );
    }
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
