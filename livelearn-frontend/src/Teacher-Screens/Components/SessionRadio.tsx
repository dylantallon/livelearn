"use client"

import { Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material"

interface SessionRadioProps {
  id: string
  initialQuestion: string
  initialChoices: string[]
  initialImages: string[]
  initialPoints?: number
  answers: string[]
}

export default function SessionRadio({
  initialQuestion,
  initialChoices,
  initialImages,
  initialPoints = 1,
  answers,
}: SessionRadioProps) {
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

        <RadioGroup>
          {initialChoices.map((choice, index) => (
            <FormControlLabel
              key={index}
              value={choice}
              control={
                <Radio
                  checked={answers.includes(choice)}
                  disabled={!answers.includes(choice)}
                />
              }
              label={
                <Typography sx={{ wordBreak: "break-word", paddingRight: 1 }}>
                  {choice}
                </Typography>
              }
              sx={{ alignItems: "center", margin: 0 }}
            />
          ))}
        </RadioGroup>
      </Box>
    </div>
  )
}
