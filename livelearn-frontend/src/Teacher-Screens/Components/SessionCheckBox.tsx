"use client"

import { Box, Typography, Checkbox, FormControlLabel, FormGroup } from "@mui/material"

interface SessionCheckBoxProps {
  id: string
  initialQuestion: string
  initialChoices: string[]
  initialImages: string[]
  initialPoints?: number
  answers: string[]
}

export default function SessionCheckBox({
  initialQuestion,
  initialChoices,
  initialImages,
  initialPoints = 1,
  answers,
}: SessionCheckBoxProps) {
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

        <FormGroup sx={{ pl: 0 }}>
          {initialChoices.map((choice, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={answers.includes(choice)}
                  disabled={!answers.includes(choice)}
                  sx={{ ml: 0 }}
                />
              }
              label={
                <Typography sx={{ wordBreak: "break-word", paddingRight: 1 }}>
                  {choice}
                </Typography>
              }
              sx={{ alignItems: "center", mb: 0, py: 0, ml: 0 }}
            />
          ))}
        </FormGroup>
      </Box>
    </div>
  )
}