"use client"

import "./Edit.css"
import CheckboxQuestion from "./Components/CheckBoxQuestion"
import TextQuestion from "./Components/TextQuestion"
import RadioQuestion from "./Components/RadioQuestion"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Stack,
  IconButton,
  TextField
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked"
import TextFieldsIcon from "@mui/icons-material/TextFields"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Header from "../Components/Header"

import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

function Edit() {
  type QuestionType = "checkbox" | "radio" | "text"

  interface Question {
    id: string
    type: QuestionType
    title: string
    choices?: string[]
  }

  const location = useLocation()
  const { pollId } = location.state || {}

  const [name, setName] = useState("Loading...")
  const [editingName, setEditingName] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) return

      try {
        const docRef = doc(db, "polls", pollId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const pollData = docSnap.data()
          setName(pollData.title)
          setQuestions(pollData.questions);
        }
        else {
          console.error("Poll could not be found")
        }
      } 
      catch (err) {
        console.error("Error loading poll:", err)
      }
    }
    fetchPoll()
  }, [pollId])

  const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const addQuestion = async (type: QuestionType) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      choices: type === "text" ? [] : ["New Choice", "New Choice", "New Choice"],
    };
  
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    handleClose();
  
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, { questions: updatedQuestions });
    } catch (error) {
      console.error("Failed to update questions in Firestore:", error);
    }
  };

  const startEditingName = () => {
    setEditingName(true)
  }

  const saveName = async () => {
    setEditingName(false);
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, { title: name });
    } catch (error) {
      console.error("Failed to update poll title:", error);
    }
  };

  const updateQuestionTitle = async (id: string, newTitle: string) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, title: newTitle } : q
    );
    setQuestions(updated);
  
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
  
      const cleaned = updated.map(({ id, title, type, choices }) => ({
        id,
        title,
        type,
        choices: choices || [],
      }));
  
      await updateDoc(pollRef, { questions: cleaned });
    } catch (error) {
      console.error("Failed to update title in Firestore:", error);
    }
  };

  const updateQuestionChoices = async (id: string, newChoices: string[]) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, choices: newChoices } : q
    );
    setQuestions(updated);
  
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
  
      const cleaned = updated.map(({ id, title, type, choices }) => ({
        id,
        title,
        type,
        choices: choices || [],
      }));
  
      await updateDoc(pollRef, { questions: cleaned });
    } catch (error) {
      console.error("Failed to update choices in Firestore:", error);
    }
  };

  const deleteQuestion = async (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
  
    try {
      if (!pollId) return;
      const pollRef = doc(db, "polls", pollId);
  
      const cleaned = updatedQuestions.map(({ id, title, type, choices }) => ({
        id,
        title,
        type,
        choices: choices || []
      }));
  
      await updateDoc(pollRef, { questions: cleaned });
    } catch (error) {
      console.error("Failed to delete question from Firestore:", error);
    }
  };

  const navigate = useNavigate()
  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className="app-container">
      <Header />
      <ArrowBackIcon className="btn-back" onClick={handleBackClick} />
      <div className="question-container">
        <div className="new-question-div">
          <div className="poll-title">
            {editingName ? (
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={4}
                  sx={{
                    flexGrow: 1,
                    width: "auto",
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                    },
                  }}
                />
                <IconButton onClick={saveName} color="primary" aria-label="Save question" size="small" sx={{ mt: 0.5 }}>
                  <CheckIcon />
                </IconButton>
              </Stack>
            ) : (
              <Box mb={0} sx={{ display: "flex", alignItems: "flex-start" }}>
                <Typography
                  variant="h5"
                  sx={{
                    flex: 1,
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                    paddingRight: 1,
                  }}
                >
                  {name}
                  <IconButton onClick={startEditingName} size="small" aria-label="Edit question" sx={{ ml: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Typography>
              </Box>
            )}
          </div>
          <div className="question-menu">
            <button className="add-question-btn" onClick={handleAddButtonClick}>
              <AddIcon fontSize="inherit" /> Add Question
            </button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={() => addQuestion("checkbox")} sx={{ gap: 1 }}>
                <CheckBoxIcon fontSize="small" />
                Checkbox Question
              </MenuItem>
              <MenuItem onClick={() => addQuestion("radio")} sx={{ gap: 1 }}>
                <RadioButtonCheckedIcon fontSize="small" />
                Radio Question
              </MenuItem>
              <MenuItem onClick={() => addQuestion("text")} sx={{ gap: 1 }}>
                <TextFieldsIcon fontSize="small" />
                Text Question
              </MenuItem>
            </Menu>
          </div>
        </div>

        {questions.map((question) => {
          if (question.type === "radio") {
            return (
              <RadioQuestion
                id={question.id}
                initialQuestion={question.title}
                initialChoices={question.choices || []}
                onQuestionChange={(newTitle) => updateQuestionTitle(question.id, newTitle)}
                onChoicesChange={(newChoices) => updateQuestionChoices(question.id, newChoices)}
                onDelete={() => deleteQuestion(question.id)}
              />
            )
          } else if (question.type === "checkbox") {
            return (
              <CheckboxQuestion
                id={question.id}
                initialQuestion={question.title}
                initialChoices={question.choices || []}
                onQuestionChange={(newTitle) => updateQuestionTitle(question.id, newTitle)}
                onChoicesChange={(newChoices) => updateQuestionChoices(question.id, newChoices)}
                onDelete={() => deleteQuestion(question.id)}
              />
            )
          } else if (question.type === "text") {
            return (
              <TextQuestion
                id={question.id}
                initialQuestion={question.title}
                onQuestionChange={(newTitle) => updateQuestionTitle(question.id, newTitle)}
                onDelete={() => deleteQuestion(question.id)}
              />
            )
          }
          return null
        })}

        {questions.length === 0 && (
          <div className="empty-question-state">
            <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
              No questions added yet. Click "Add Question" to get started.
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export default Edit
