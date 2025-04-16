import React, { useEffect, useRef, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  getDoc,
  setDoc,
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

  // Function to reset score document in Firestore when starting a new poll session
  const resetScoreDocument = async (pollId: string) => {
    if (!user?.uid || !pollId || isDisplay) return;
    
    try {
      // Create a fresh document for this poll session 
      const scoresRef = firestoreDoc(db, `polls/${pollId}/scores/${user.uid}`);
      await setDoc(scoresRef, {
        points: 0
      });
      console.log("Score document reset for new session");
    } catch (error) {
      console.error("Error resetting score document:", error);
    }
  };

  // Function to save score to Firestore
  const saveScoreToFirestore = async (
    pollId: string,
    questionIndex: number,
    answer: string | string[],
    points: number
  ) => {
    if (!user?.uid || !pollId) return;
    
    try {
      // Create a path to the student's scores document
      const scoresRef = firestoreDoc(db, `polls/${pollId}/scores/${user.uid}`);
      
      // Get existing scores to calculate total
      const updatedScores = [...questionScores];
      updatedScores[questionIndex] = points;
      const totalPoints = updatedScores.reduce((sum, val) => sum + (val || 0), 0);
      
      // Format answer as needed
      const formattedAnswer = Array.isArray(answer) ? answer : [answer];
      
      // Create or update document with structure matching the screenshot
      await setDoc(scoresRef, {
        points: totalPoints, // Total points at top level
        questions: {
          [questionIndex]: {
            answer: formattedAnswer,
            points: points
          }
        }
      }, { merge: true });
      
      console.log(`Score saved for question ${questionIndex}, earned points: ${points}, total: ${totalPoints}`);
    } catch (error) {
      console.error("Error saving score to Firestore:", error);
    }
  };

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
          
          // Save final scores to Firestore if we have a poll ID and user
          if (lastPollId.current && user?.uid && !isDisplay) {
            try {
              const scoresRef = firestoreDoc(db, `polls/${lastPollId.current}/scores/${user.uid}`);
              await setDoc(scoresRef, {
                points: totalScore // Update total points
              }, { merge: true });
              console.log("Final score saved:", totalScore);
            } catch (error) {
              console.error("Error saving final score:", error);
            }
          }
          
          setFinalScore({ score: totalScore, total: totalPoints });
          setSessionEnded(true);
          lastPollId.current = null;
        }
        return;
      }

      const data = docSnap.data();
      if (!data?.pollId) return;

      // Check if this is a new poll ID
      const isNewPoll = data.pollId !== lastPollId.current;
      
      // If this is a new poll ID, reset the score document
      if (isNewPoll && user?.uid && !isDisplay) {
        await resetScoreDocument(data.pollId);
      }

      if (sessionEnded && isNewPoll) {
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
              // Set the correct answer for display purposes
              if (current.type === "MCQ") {
                setLastCorrectAnswer(current.answer);
              } else if (current.type === "FRQ") {
                setLastCorrectAnswer(current.acceptedAnswers.join(", "));
              } else if (current.type === "Checkbox") {
                setLastCorrectAnswer(current.answers.join(", "));
              }

              // Only update UI display for no-answer case, no Firebase updates
              if (noAnswer) {
                // Set empty answer for display purposes only
                if (current.type === "MCQ") setLastUserAnswer("");
                else if (current.type === "FRQ") setLastUserAnswer("");
                else if (current.type === "Checkbox") setLastUserAnswer([]);

                setQuestionScores((prev) => {
                  const updated = [...prev];
                  while (updated.length <= data.questionIndex) updated.push(0);
                  updated[data.questionIndex] = 0;
                  return updated;
                });
                
                // REMOVE THIS BLOCK - this is causing the Firebase update on show answer
                // if (!isDisplay && user?.uid && data.pollId) {
                //   const emptyAnswer = current.type === "Checkbox" ? [] : "";
                //   saveScoreToFirestore(data.pollId, data.questionIndex, emptyAnswer, 0);
                // }
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
  }, [questions, sessionStarted, lastUserAnswer, courseId, questionScores, sessionEnded, user, isDisplay]);

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

    const pointsEarned = isCorrect ? current.points : 0;
    
    setQuestionScores((prev) => {
      const updated = [...prev];
      updated[questionIndex] = pointsEarned;
      return updated;
    });

    // Save the answer and score to Firestore
    if (!isDisplay && user?.uid && lastPollId.current) {
      await saveScoreToFirestore(lastPollId.current, questionIndex, answer, pointsEarned);
    }

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
      
      // Save final score to Firestore when student completes all questions
      if (!isDisplay && user?.uid && lastPollId.current) {
        const scoresRef = firestoreDoc(db, `polls/${lastPollId.current}/scores/${user.uid}`);
        setDoc(scoresRef, {
          points: totalScore,
        }, { merge: true }).catch(err => console.error("Error saving final score:", err));
      }
      
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
            height: "100 vh",
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