"use client"

import "./Edit.css"
import CheckboxQuestion from "./Components/CheckBoxQuestion"
import TextQuestion from "./Components/TextQuestion"
import RadioQuestion from "./Components/RadioQuestion"
import { useNavigate } from "react-router-dom"
import type React from "react"
import { useState } from "react"
import { Box, Typography, Menu, MenuItem, Stack, IconButton, TextField } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked"
import TextFieldsIcon from "@mui/icons-material/TextFields"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from "../Components/Header"


function Edit() {
  type QuestionType = "checkbox" | "radio" | "text"

  interface Question {
    id: string
    type: QuestionType
    title: string
    choices?: string[]
  }
  const [name, setName] = useState("Survey Name")
  const [editingName, setEditingName] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      choices: type !== "text" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    }
    setQuestions([...questions, newQuestion])
    handleClose()
  }

  const startEditingName = () => {
    setEditingName(true)
  }

  const saveName = () => {
    setEditingName(false)
  }

  const updateQuestionTitle = (id: string, newTitle: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, title: newTitle } : q)))
  }

  const updateQuestionChoices = (id: string, newChoices: string[]) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, choices: newChoices } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const navigate = useNavigate()
  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className="app-container">
      <Header/>
      {/* <div className = "back-div" >
                <button className="btn-back" onClick={handleBackClick}> ⟵ Back</button>
            </div> */}
      <ArrowBackIcon className="btn-back" onClick={handleBackClick}/>
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
                    <EditIcon fontSize="small"/>
                  </IconButton>
                </Typography>
              </Box>
            )}
          </div>
          <div className="question-menu">
            <button className="add-question-btn" onClick={handleAddButtonClick}>
              <AddIcon fontSize="inherit" /> Add Question
            </button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
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

        {/* Render dynamically added questions */}
        {questions.map((question) => {
          if (question.type === "radio") {
            return (
              <RadioQuestion
                key={question.id}
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
                key={question.id}
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
                key={question.id}
                id={question.id}
                initialQuestion={question.title}
                onQuestionChange={(newTitle) => updateQuestionTitle(question.id, newTitle)}
                onDelete={() => deleteQuestion(question.id)}
              />
            )
          }
          return null
        })}

        {/* Show a message when there are no questions */}
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

