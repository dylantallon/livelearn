"use client"

import { useState, useRef } from "react"
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
import ImageIcon from "@mui/icons-material/Image"
import { ConfirmationDialog } from "./Confirmation"

interface RadioQuestionProps {
  id: string
  initialQuestion: string
  initialChoices: string[]
  onQuestionChange: (newQuestion: string) => void
  onChoicesChange: (newChoices: string[]) => void
  onDelete: () => void
  initialImages: string[]
  onImagesChange?: (images: string[]) => void
  initialPoints?: number
  onPointsChange?: (points: number) => void
  answers: string[]
  onAnswersChange: (answers: string[]) => void
}

export default function RadioQuestion({
  initialQuestion,
  initialChoices,
  onQuestionChange,
  onChoicesChange,
  onDelete,
  initialImages,
  onImagesChange,
  initialPoints = 1,
  onPointsChange,
  answers,
  onAnswersChange,
}: RadioQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [choices, setChoices] = useState(initialChoices)
  const [selectedChoice, setSelectedChoice] = useState(answers[0] || "")
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(null)
  const [editingChoiceValue, setEditingChoiceValue] = useState("")
  const [images, setImages] = useState(initialImages)
  const [points, setPoints] = useState(initialPoints)
  const [editingPoints, setEditingPoints] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

      // If user edited the selected answer, update it
      if (answers.includes(oldChoice)) {
        const updatedAnswers = answers.map((a) => (a === oldChoice ? editingChoiceValue : a))
        onAnswersChange(updatedAnswers)
        setSelectedChoice(editingChoiceValue)
      }

      setEditingChoiceIndex(null)
    }
  }

  const savePoints = () => {
    setEditingPoints(false)
    onPointsChange?.(points)
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

    // Remove from answers if it was selected
    if (answers.includes(choiceToDelete)) {
      const updatedAnswers = answers.filter((a) => a !== choiceToDelete)
      onAnswersChange(updatedAnswers)
      if (selectedChoice === choiceToDelete) setSelectedChoice("")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const readers: Promise<string>[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      readers.push(
        new Promise((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
      )
    }

    Promise.all(readers).then((results) => {
      setImages((prev) => {
        const updated = [...prev, ...results]
        onImagesChange?.(updated)
        return updated
      })
    })

    e.target.value = ""
  }

  const deleteImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      onImagesChange?.(updated)
      return updated
    })
  }

  const handleSelection = (value: string) => {
    setSelectedChoice(value)
    onAnswersChange([value]) // Only one answer allowed
  }

  return (
    <div className="question-div">
      <Box>
        <Box mb={1}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {editingPoints ? (
              <TextField
                size="small"
                value={points}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  if (!isNaN(value) && value >= 0) setPoints(value)
                }}
                onBlur={savePoints}
                type="number"
                sx={{
                  maxWidth: 80,
                  mb: 0.5,
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                    color: "gray",
                  },
                }}
                autoFocus
              />
            ) : (
              <Typography
                variant="body2"
                color="gray"
                sx={{ cursor: "pointer", mb: 0.5 }}
                onClick={() => setEditingPoints(true)}
              >
                Points: {points}
              </Typography>
            )}

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
              <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
                <Typography
                  variant="h6"
                  sx={{ flex: 1, wordBreak: "break-word", lineHeight: 1.5, paddingRight: 1 }}
                  onClick={() => setEditingQuestion(true)}
                >
                  {question}
                </Typography>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  <button
                    onClick={addChoice}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #007bff",
                      borderRadius: "5px",
                      padding: "5px",
                      backgroundColor: "white",
                    }}
                  >
                    <AddIcon fontSize="inherit" sx={{ color: "#007bff", margin: "0" }} />
                    <Typography variant="subtitle2" color="#007bff">Add Choice</Typography>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #007bff",
                      borderRadius: "5px",
                      padding: "5px",
                      marginLeft: "5px",
                      backgroundColor: "white",
                    }}
                  >
                    <ImageIcon fontSize="inherit" sx={{ color: "#007bff", margin: "0" }} />
                    <Typography variant="subtitle2" color="#007bff">Add Image</Typography>
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  <ConfirmationDialog
                    onConfirm={onDelete}
                    title="Delete Question"
                    description="Are you sure you want to delete this question? This action cannot be undone."
                    trigger={
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          borderRadius: "5px",
                          padding: "5px",
                          marginLeft: "5px",
                          backgroundColor: "#c95151",
                        }}
                      >
                        <DeleteOutlineIcon fontSize="inherit" sx={{ color: "white", margin: "0" }} />
                        <Typography variant="subtitle2" color="white">Delete Question</Typography>
                      </button>
                    }
                  />
                </div>
              </Box>
            )}
          </Box>

          {images.length > 0 && (
            <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {images.map((src, index) => (
                <Box key={index} sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={src}
                    alt={`Uploaded ${index}`}
                    style={{ width: "200px", height: "auto", borderRadius: 4 }}
                  />
                  <ConfirmationDialog
                    onConfirm={() => deleteImage(index)}
                    title="Delete Image"
                    description="Are you sure you want to delete this image? This action cannot be undone."
                    trigger={
                      <IconButton
                        size="small"
                        sx={{
                          color: "#c95151",
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "white",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <RadioGroup value={selectedChoice} onChange={(e) => handleSelection(e.target.value)}>
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
