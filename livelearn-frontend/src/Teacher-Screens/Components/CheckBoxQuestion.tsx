"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
  Stack,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import CheckIcon from "@mui/icons-material/Check"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

interface CheckboxQuestionProps {
  id: string
  initialQuestion: string
  initialChoices: string[]
  onQuestionChange: (newQuestion: string) => void
  onChoicesChange: (newChoices: string[]) => void
  onDelete: () => void
}

export default function CheckboxQuestion({
  initialQuestion,
  initialChoices,
  onQuestionChange,
  onChoicesChange,
  onDelete,
}: CheckboxQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [choices, setChoices] = useState(initialChoices)
  const [selectedChoices, setSelectedChoices] = useState<string[]>([])
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null)
  const [editingChoiceValue, setEditingChoiceValue] = useState("")

  // Handle question editing
  const startEditingQuestion = () => {
    setEditingQuestion(true)
  }

  const saveQuestion = () => {
    setEditingQuestion(false)
    onQuestionChange(question)
  }

  // Handle choice editing
  const startEditingChoice = (index: number) => {
    setEditingChoiceIndex(index)
    setEditingChoiceValue(choices[index])
  }

  const saveChoice = () => {
    if (editingChoiceIndex !== null) {
      const newChoices = [...choices]
      const oldChoice = newChoices[editingChoiceIndex]
      newChoices[editingChoiceIndex] = editingChoiceValue
      setChoices(newChoices)
      onChoicesChange(newChoices)

      // Update the selected choices if the edited choice was selected
      if (selectedChoices.includes(oldChoice)) {
        setSelectedChoices((prev) => prev.map((choice) => (choice === oldChoice ? editingChoiceValue : choice)))
      }

      setEditingChoiceIndex(null)
    }
  }

  // Add a new choice
  const addChoice = () => {
    const newChoices = [...choices, `New Choice`]
    setChoices(newChoices)
    onChoicesChange(newChoices)
  }

  // Delete a choice
  const deleteChoice = (indexToDelete: number) => {
    const choiceToDelete = choices[indexToDelete]
    const newChoices = choices.filter((_, index) => index !== indexToDelete)
    setChoices(newChoices)
    onChoicesChange(newChoices)

    // Remove the choice from selected choices if it was selected
    if (selectedChoices.includes(choiceToDelete)) {
      setSelectedChoices((prev) => prev.filter((choice) => choice !== choiceToDelete))
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (choice: string) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choice)) {
        return prev.filter((item) => item !== choice)
      } else {
        return [...prev, choice]
      }
    })
  }

  return (
    <div className="question-div">
    <Box>
      <Box mb={1}>
        {editingQuestion ? (
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              fullWidth
              variant="outlined"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
              size="small"
              multiline
              minRows={1}
              maxRows={4}
              sx={{
                "& .MuiOutlinedInput-root": {
                  alignItems: "flex-start",
                },
              }}
            />
            <IconButton onClick={saveQuestion} color="primary" aria-label="Save question" size="small" sx={{ mt: 0.5 }}>
              <CheckIcon />
            </IconButton>
          </Stack>
        ) : (
          <Box mb={1} sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                wordBreak: "break-word",
                lineHeight: 1.5,
                paddingRight: 1,
              }}
            >
              {question}
              <IconButton onClick={startEditingQuestion} size="small" aria-label="Edit question" sx={{ ml: 0.5 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Box/>
            <div style={{display: "flex", flexWrap: "wrap"}}>
            <button onClick={addChoice} style={{ display: "flex", alignItems: "center", border: "1px solid #007bff", borderRadius: "5px", padding: "5px", backgroundColor: "white"}}>
                        <AddIcon fontSize="inherit" sx={{color: "#007bff", margin: "0"}}/>
                <Typography variant="subtitle2" color="#007bff">
                    Add Option
                </Typography>
            </button>
            <button onClick={onDelete} style={{ display: "flex", alignItems: "center", borderRadius: "5px", padding: "5px", marginLeft: "5px", backgroundColor: "#c95151"}}>
                        <DeleteOutlineIcon fontSize="inherit" sx={{color: "white", margin: "0"}}/>
                <Typography variant="subtitle2" color="white">
                    Delete Question
                </Typography>
            </button>
            </div>
          </Box>
        )}
      </Box>

      <Box>
        {choices.map((choice, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 0,
            }}
          >
            {editingChoiceIndex === index ? (
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1 }}>
                <Checkbox checked={selectedChoices.includes(choice)} disabled sx={{ pt: 0.5 }} />
                <TextField
                  fullWidth
                  variant="outlined"
                  value={editingChoiceValue}
                  onChange={(e) => setEditingChoiceValue(e.target.value)}
                  size="small"
                  autoFocus
                  multiline
                  minRows={1}
                  maxRows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                    },
                  }}
                />
                <IconButton onClick={saveChoice} color="primary" aria-label="Save choice" size="small" sx={{ mt: 0.5 }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <FormControlLabel
                control={
                  <Checkbox checked={selectedChoices.includes(choice)} onChange={() => handleCheckboxChange(choice)} />
                }
                label={choice}
                sx={{
                  flex: 1,
                  alignItems: "flex-start",
                  margin: 0,
                  "& .MuiFormControlLabel-label": {
                    wordBreak: "break-word",
                    paddingRight: 1,
                    paddingTop: 1,
                  },
                }}
              />
            )}

            {editingChoiceIndex !== index && (
              <Box sx={{ display: "flex", mt: 0.5 }}>
                <IconButton onClick={() => startEditingChoice(index)} size="small" aria-label="Edit choice">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => deleteChoice(index)} size="small" aria-label="Delete choice" color="error">
                  <DeleteIcon sx={{color: "#c95151"}} fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
    </div>
  )
}

