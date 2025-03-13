"use client"

import { useState } from "react"
import {Box, Typography, TextField, IconButton, Stack} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import CheckIcon from "@mui/icons-material/Check"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

interface TextQuestionProps {
  id: string
  initialQuestion: string
  onQuestionChange: (newQuestion: string) => void
  onDelete: () => void
}

export default function TextQuestion({initialQuestion, onQuestionChange, onDelete }: TextQuestionProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState("")
  const [editingQuestion, setEditingQuestion] = useState(false)

  // Handle question editing
  const startEditingQuestion = () => {
    setEditingQuestion(true)
  }

  const saveQuestion = () => {
    setEditingQuestion(false)
    onQuestionChange(question)
  }

  return (
    <div className="question-div">
    <Box>
      <Box mb={3}>
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
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
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
            </Typography>
            <IconButton onClick={startEditingQuestion} size="small" aria-label="Edit question" sx={{ mt: 0 }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <button onClick={onDelete} style={{ display: "flex", alignItems: "center", borderRadius: "5px", padding: "5px", marginLeft: "5px", backgroundColor: "#c95151"}}>
                        <DeleteOutlineIcon fontSize="inherit" sx={{color: "white", margin: "0"}}/>
                <Typography variant="subtitle2" color="white">
                    Delete Question
                </Typography>
            </button>
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

