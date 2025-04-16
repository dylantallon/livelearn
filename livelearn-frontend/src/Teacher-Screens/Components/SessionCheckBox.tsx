"use client";

import {
  Box,
  Typography,
  Checkbox,
  FormGroup,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

interface SessionCheckBoxProps {
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

export default function SessionCheckBox({
  initialQuestion,
  initialChoices,
  initialImages,
  initialPoints = 1,
  answers,
  pollId,
  questionIndex,
  activeUsers,
  userAnswered,
}: SessionCheckBoxProps) {
  const [choiceCounts, setChoiceCounts] = useState<number[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = Array(initialChoices.length).fill(0);

      for (const uid of userAnswered) {
        const userScoreRef = doc(db, "polls", pollId, "scores", uid);
        const userSnap = await getDoc(userScoreRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const userAnswers = data.questions?.[questionIndex]?.answer || [];

          userAnswers.forEach((ans: string) => {
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

        <FormGroup sx={{ pl: 0 }}>
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
                  flexDirection: "column",
                  alignItems: "stretch",
                  mb: 1.5,
                  gap: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={answers.includes(choice)}
                    disabled={!answers.includes(choice)}
                    sx={{ paddingRight: 1 }}
                  />
                  <Typography
                    sx={{
                      wordBreak: "break-word",
                      paddingRight: 2,
                      fontWeight: 500,
                    }}
                  >
                    {choice}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", width: "100%", pl: 4 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      flexGrow: 1,
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
        </FormGroup>
      </Box>
    </div>
  );
}
