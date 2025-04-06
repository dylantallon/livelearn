"use client"

import { Box, Typography, Chip, TextField } from "@mui/material"

interface SessionTextProps {
  id: string
  initialQuestion: string
  initialImages: string[]
  initialPoints?: number
  answers: string[]
}

export default function SessionText({
  initialQuestion,
  initialImages,
  initialPoints = 1,
  answers,
}: SessionTextProps) {
  return (
    <div className="question-div">
      <Box>
        <Box mb={1}>
          <Typography
            variant="body2"
            color="gray"
            sx={{ mb: 0.5 }}
          >
            Points: {initialPoints}
          </Typography>

          <Typography
            variant="h6"
            sx={{ wordBreak: "break-word", lineHeight: 1.5, paddingRight: 1 }}
          >
            {initialQuestion}
          </Typography>

          {initialImages.length > 0 && (
            <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {initialImages.map((src, index) => (
                <Box key={index} sx={{ display: "inline-block" }}>
                  <img
                    src={src}
                    alt={`Uploaded ${index}`}
                    style={{ width: "200px", height: "auto", borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box mb={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {answers.map((a, index) => (
            <Chip
              key={index}
              label={a}
              sx={{ backgroundColor: "#f0f0f0", color: "#555" }}
            />
          ))}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your answer here"
          value="|"
          multiline
          minRows={3}
          maxRows={6}
          disabled
        />
      </Box>
    </div>
  )
}
