"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import {
  Box,
  Typography,
} from "@mui/material"

import SessionCheckBox from "./Components/SessionCheckBox"
import SessionRadio from "./Components/SessionRadio"
import SessionText from "./Components/SessionText"
import { ConfirmationDialog } from "./Components/Confirmation"
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import "./session.css"
import Header from '../Components/Header'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { AuthContext } from "../Components/AuthContext";

interface Question {
  id: string
  type: "checkbox" | "radio" | "text"
  title: string
  choices?: string[]
  images?: string[]
  points?: number
  answers?: string[]
}

export default function Session() {
  const { courseId } = useContext(AuthContext);
  const location = useLocation()
  const { pollId } = location.state || {}

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answerShown, setAnswerShown] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) return

      try {
        const docRef = doc(db, "polls", pollId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const pollData = docSnap.data()
          setQuestions(pollData.questions || [])
        } else {
          console.error("Poll not found")
        }
      } catch (error) {
        console.error("Failed to fetch poll data:", error)
      }
    }
    fetchPoll()
  }, [pollId])

  const updateSessionIndex = async (index: number) => {
    try {
      await updateDoc(doc(db, "session", courseId), {
        questionIndex: index,
      });
    } catch (err) {
      console.error("Failed to update question index:", err);
    }
  };

  const resetShowAnswer = async () => {
    try {
      await updateDoc(doc(db, "session", courseId), {
        showAnswer: false,
      });
    } catch (err) {
      console.error("Failed to reset showAnswer:", err);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      updateSessionIndex(newIndex);
      resetShowAnswer();
      setAnswerShown(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      updateSessionIndex(newIndex);
      resetShowAnswer();
      setAnswerShown(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const toggleAnswerShown = async () => {
    const newShown = !answerShown;
    setAnswerShown(newShown);
    try {
      await updateDoc(doc(db, "session", courseId), {
        showAnswer: newShown,
      });
    } catch (err) {
      console.error("Failed to update showAnswer:", err);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="app-container">
      <Header />
      <div className="question-session-container">
        <Box className="session-inner">
          <div
            className="sticky-question-header"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1rem" }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              className="session-title"
              sx={{ lineHeight: 1, flex: 1, alignItems: "center" }}
            >
              Question {currentQuestionIndex + 1}/{questions.length}:
            </Typography>
            <div className="session-nav-buttons">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="nav-button"
              >
                <NavigateBeforeIcon fontSize="inherit" />
                Back
              </button>

              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="nav-button"
              >
                Next
                <NavigateNextIcon fontSize="inherit" />
              </button>
            </div>
          </div>

          <div className="question-scrollable-area">
            {currentQuestion?.type === "radio" && (
              <SessionRadio
                {...currentQuestion}
                initialQuestion={currentQuestion.title}
                initialChoices={currentQuestion.choices || []}
                initialImages={currentQuestion.images || []}
                initialPoints={currentQuestion.points ?? 1}
                answers={currentQuestion.answers || []}
              />
            )}
            {currentQuestion?.type === "checkbox" && (
              <SessionCheckBox
                {...currentQuestion}
                initialQuestion={currentQuestion.title}
                initialChoices={currentQuestion.choices || []}
                initialImages={currentQuestion.images || []}
                initialPoints={currentQuestion.points ?? 1}
                answers={currentQuestion.answers || []}
              />
            )}
            {currentQuestion?.type === "text" && (
              <SessionText
                {...currentQuestion}
                initialQuestion={currentQuestion.title}
                initialImages={currentQuestion.images || []}
                initialPoints={currentQuestion.points ?? 1}
                answers={currentQuestion.answers || []}
              />
            )}
          </div>

          <Box className="session-controls">
            <div className="session-left-buttons">
              <div className="answered-div">3/100 Answered</div>
              <button className="answer-button" onClick={toggleAnswerShown}>
                {answerShown ? "Hide Answer" : "Show Answer"}
              </button>
            </div>
            <div className="session-right-buttons">
              <ConfirmationDialog
                onConfirm={async () => {
                  try {
                    await deleteDoc(doc(db, "session", courseId));
                  } catch (err) {
                    console.error("Failed to delete session:", err);
                  } finally {
                    handleBackClick();
                  }
                }}
                title="End Session"
                description={`Are you sure you want to end the session?`}
                trigger={
                  <button className="session-end-button">End Session</button>
                }
              />
            </div>
          </Box>
        </Box>
      </div>
    </div>
  );
}
