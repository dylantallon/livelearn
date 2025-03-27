"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  IconButton,
  Stack,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { ConfirmationDialog } from "./Confirmation"

interface RadioQuestionProps {
  id: string
  initialQuestion: string
  initialChoices: string[]
  onQuestionChange: (newQuestion: string) => void
  onChoicesChange: (newChoices: string[]) => void
  onDelete: () => void
}

export default function RadioQuestion({
  initialQuestion,
  initialChoices,
  onQuestionChange,
  onChoicesChange,
  onDelete,
}: RadioQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [choices, setChoices] = useState(initialChoices)
  const [selectedChoice, setSelectedChoice] = useState<string>("")
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null)
  const [editingChoiceValue, setEditingChoiceValue] = useState("")

  const saveQuestion = () => {
    setEditingQuestion(false)
    onQuestionChange(question)
  }

  const saveChoice = () => {
    if (editingChoiceIndex !== null) {
      const newChoices = [...choices]
      const oldChoice = newChoices[editingChoiceIndex]
      newChoices[editingChoiceIndex] = editingChoiceValue
      setChoices(newChoices)
      onChoicesChange(newChoices)
      if (selectedChoice === oldChoice) {
        setSelectedChoice(editingChoiceValue)
      }
      setEditingChoiceIndex(null)
    }
  }

  const addChoice = () => {
    const newChoices = [...choices, `Choice ${choices.length + 1}`]
    setChoices(newChoices)
    onChoicesChange(newChoices)
  }

  const deleteChoice = (index: number) => {
    const choiceToDelete = choices[index]
    const newChoices = choices.filter((_, i) => i !== index)
    setChoices(newChoices)
    onChoicesChange(newChoices)
    if (selectedChoice === choiceToDelete) {
      setSelectedChoice("")
    }
  }

  return (
    <div className="question-div">
      <Box>
        <Box mb={1}>
          {editingQuestion ? (
            <TextField
              fullWidth
              variant="outlined"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onBlur={saveQuestion}
              autoFocus
              size="small"
              multiline
              minRows={1}
              maxRows={4}
              sx={{ "& .MuiOutlinedInput-root": { alignItems: "flex-start" } }}
            />
          ) : (
            <Box mb={1} sx={{ display: "flex", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
              <Typography
                variant="h6"
                sx={{ flex: 1, wordBreak: "break-word", lineHeight: 1.5, paddingRight: 1 }}
                onClick={() => setEditingQuestion(true)}
              >
                {question}
              </Typography>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <button onClick={addChoice} style={{ display: "flex", alignItems: "center", border: "1px solid #007bff", borderRadius: "5px", padding: "5px", backgroundColor: "white" }}>
                  <AddIcon fontSize="inherit" sx={{ color: "#007bff", margin: "0" }} />
                  <Typography variant="subtitle2" color="#007bff">Add Option</Typography>
                </button>

                <ConfirmationDialog
                  onConfirm={onDelete}
                  title="Delete Question"
                  description="Are you sure you want to delete this question? This action cannot be undone."
                  trigger={
                    <button style={{ display: "flex", alignItems: "center", borderRadius: "5px", padding: "5px", marginLeft: "5px", backgroundColor: "#c95151" }}>
                      <DeleteOutlineIcon fontSize="inherit" sx={{ color: "white", margin: "0" }} />
                      <Typography variant="subtitle2" color="white">Delete Question</Typography>
                    </button>
                  }
                />
              </div>
            </Box>
          )}
        </Box>

        <RadioGroup value={selectedChoice} onChange={(e) => setSelectedChoice(e.target.value)}>
          {choices.map((choice, index) => (
            <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0 }}>
              {editingChoiceIndex === index ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                  <Radio value={choice} disabled />
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={editingChoiceValue}
                    onChange={(e) => setEditingChoiceValue(e.target.value)}
                    onBlur={saveChoice}
                    autoFocus
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={3}
                  />
                </Stack>
              ) : (
                <FormControlLabel
                  value={choice}
                  control={<Radio />}
                  label={
                    <Typography
                      onClick={() => {
                        setEditingChoiceIndex(index)
                        setEditingChoiceValue(choice)
                      }}
                      sx={{ cursor: "pointer", alignSelf: "center" }}
                    >
                      {choice}
                    </Typography>
                  }
                  sx={{
                    flex: 1,
                    alignItems: "center",
                    margin: 0,
                    "& .MuiFormControlLabel-label": {
                      wordBreak: "break-word",
                      paddingRight: 1,
                    },
                  }}
                />
              )}

              {editingChoiceIndex !== index && (
                <Box sx={{ display: "flex", mt: 0.5 }}>
                  <ConfirmationDialog
                    onConfirm={() => deleteChoice(index)}
                    title="Delete Choice"
                    description="Are you sure you want to delete this choice? This action cannot be undone."
                    trigger={
                      <IconButton size="small" aria-label="Delete choice" color="error">
                        <DeleteIcon sx={{ color: "#c95151" }} fontSize="small" />
                      </IconButton>
                    }
                  />
                </Box>
              )}
            </Box>
          ))}
        </RadioGroup>
      </Box>
    </div>
  )
}
