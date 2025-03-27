"use client"

import { useState } from "react"
import { Box, Typography, TextField } from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { ConfirmationDialog } from "./Confirmation"

interface TextQuestionProps {
  id: string
  initialQuestion: string
  onQuestionChange: (newQuestion: string) => void
  onDelete: () => void
}

export default function TextQuestion({
  initialQuestion,
  onQuestionChange,
  onDelete
}: TextQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(false)

  const saveQuestion = () => {
    setEditingQuestion(false)
    onQuestionChange(question)
  }

  return (
    <div className="question-div">
      <Box>
        <Box mb={3}>
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  alignItems: "flex-start",
                },
              }}
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
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your answer here"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          multiline
          minRows={3}
          maxRows={6}
        />
      </Box>
    </div>
  )
}
