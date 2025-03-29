"use client"

import { useState, useRef } from "react"
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip
} from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import ImageIcon from "@mui/icons-material/Image"
import CloseIcon from "@mui/icons-material/Close"
import { ConfirmationDialog } from "./Confirmation"

interface TextQuestionProps {
  id: string
  initialQuestion: string
  onQuestionChange: (newQuestion: string) => void
  onDelete: () => void
  initialImages: string[]
  onImagesChange?: (images: string[]) => void
  initialPoints?: number
  onPointsChange?: (points: number) => void
  answers: string[]
  onAnswersChange: (answers: string[]) => void
}

export default function TextQuestion({
  initialQuestion,
  onQuestionChange,
  onDelete,
  initialImages,
  onImagesChange,
  initialPoints = 1,
  onPointsChange,
  answers,
  onAnswersChange,
}: TextQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [editingPoints, setEditingPoints] = useState(false)
  const [points, setPoints] = useState(initialPoints)
  const [images, setImages] = useState(initialImages)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const saveQuestion = () => {
    setEditingQuestion(false)
    onQuestionChange(question)
  }

  const savePoints = () => {
    setEditingPoints(false)
    onPointsChange?.(points)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => {
            const updated = [...prev, reader.result as string]
            onImagesChange?.(updated)
            return updated
          })
        }
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const deleteImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      onImagesChange?.(updated)
      return updated
    })
  }

  const handleAnswerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && answer.trim() !== "") {
      e.preventDefault()
      const newAnswers = [...answers, answer.trim()]
      onAnswersChange(newAnswers)
      setAnswer("")
    }
  }

  const handleDeleteAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index)
    onAnswersChange(newAnswers)
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
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #007bff",
                      borderRadius: "5px",
                      padding: "5px",
                      marginRight: "5px",
                      backgroundColor: "white",
                    }}
                  >
                    <ImageIcon fontSize="inherit" sx={{ color: "#007bff", margin: "0" }} />
                    <Typography variant="subtitle2" color="#007bff">Add Image</Typography>
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
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

        {/* Answer Chips */}
        <Box mb={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {answers.map((a, index) => (
            <Chip
              key={index}
              label={a}
              onDelete={() => handleDeleteAnswer(index)}
              deleteIcon={<CloseIcon/>}
              sx={{ backgroundColor: "#f0f0f0", color: "#555" }}
            />
          ))}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your answer here"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleAnswerKeyDown}
          multiline
          minRows={3}
          maxRows={6}
        />
      </Box>
    </div>
  )
}
