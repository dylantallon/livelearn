"use client";

import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface SessionRadioProps {
  id: string;
  initialQuestion: string;
  initialChoices: string[];
  initialImages: string[];
  initialPoints?: number;
  answers: string[];
  pollId: string;
  courseId: string;
  questionIndex: number;
  activeUsers: string[];
  userAnswered: string[];
}

export default function SessionRadio({
  initialQuestion,
  initialChoices,
  initialImages,
  initialPoints = 1,
  answers,
  pollId,
  questionIndex,
  activeUsers,
  userAnswered,
}: SessionRadioProps) {
  const [choiceCounts, setChoiceCounts] = useState<number[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = Array(initialChoices.length).fill(0);

      for (const uid of userAnswered) {
        const userScoreRef = doc(db, "polls", pollId, "scores", uid);
        const userSnap = await getDoc(userScoreRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const selected = data.questions?.[questionIndex]?.answer || [];

          selected.forEach((ans: string) => {
            const index = initialChoices.indexOf(ans);
            if (index !== -1) {
              counts[index]++;
            }
          });
        }
      }

      setChoiceCounts(counts);
    };

    fetchCounts();
  }, [pollId, userAnswered, questionIndex, initialChoices]);

  return (
    <div className="question-div">
      <Box>
        <Box mb={1}>
          <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
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
          {initialChoices.map((choice, index) => {
            const count = choiceCounts[index] || 0;
            const percent = activeUsers.length
              ? (count / activeUsers.length) * 100
              : 0;

            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                  gap: 1,
                }}
              >
                <FormControlLabel
                  value={choice}
                  control={
                    <Radio
                      checked={answers.includes(choice)}
                      disabled={!answers.includes(choice)}
                    />
                  }
                  label={
                    <Typography sx={{ wordBreak: "break-word", pr: 1 }}>
                      {choice}
                    </Typography>
                  }
                  sx={{
                    flex: "0 0 auto",
                    m: 0,
                    pr: 1,
                    alignItems: "center",
                  }}
                />

                <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      flex: 1,
                      borderRadius: 5,
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ width: "30px", textAlign: "right" }}
                  >
                    {count}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </RadioGroup>
      </Box>
    </div>
  );
}
