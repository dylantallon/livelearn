"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Chip, TextField } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import cloud from "d3-cloud";
import { schemeCategory10 } from "d3-scale-chromatic";
import { select } from "d3-selection";

interface SessionTextProps {
  id: string;
  initialQuestion: string;
  initialImages: string[];
  initialPoints?: number;
  pollId: string;
  courseId: string;
  questionIndex: number;
  userAnswered: string[];
  correctAnswers: string[];
}

export default function SessionText({
  initialQuestion,
  initialImages,
  initialPoints = 1,
  pollId,
  questionIndex,
  userAnswered,
  correctAnswers,
}: SessionTextProps) {
  const [wordList, setWordList] = useState<{ text: string; value: number }[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      const allAnswers: string[] = [];

      for (const uid of userAnswered) {
        const scoreRef = doc(db, "polls", pollId, "scores", uid);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          const data = scoreSnap.data();
          const questionData = data.questions?.[questionIndex.toString()];
          const qAnswer = questionData?.answer;

          if (Array.isArray(qAnswer)) {
            qAnswer.forEach((entry: string) => {
              if (typeof entry === "string") allAnswers.push(entry);
            });
          } else if (typeof qAnswer === "string") {
            allAnswers.push(qAnswer);
          }
        }
      }

      const wordCounts = allAnswers
        .flatMap((answer) =>
          answer
            .split(",")
            .map(word => word.trim())
            .filter(word => word.length > 0)
        )
        .reduce((acc: Record<string, number>, word: string) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});

      const words = Object.entries(wordCounts).map(([text, value]) => ({
        text,
        value,
      }));

      setWordList(words);
    };

    fetchAnswers();
  }, [pollId, questionIndex, userAnswered]);

  useEffect(() => {
    if (!svgRef.current || wordList.length === 0) return;

    const layout = cloud()
      .size([600, 300])
      .words(wordList.map(d => ({
        text: d.text,
        size: Math.min(10 + d.value * 4, 60)
      })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("sans-serif")
      .fontSize(d => d.size!)
      .on("end", draw);

    layout.start();

    function draw(words: any[]) {
      const svg = select(svgRef.current!);
      svg.selectAll("*").remove();

      svg
        .attr("width", 600)
        .attr("height", 300)
        .append("g")
        .attr("transform", "translate(300,150)")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", () => schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [wordList]);

  return (
    <div className="question-div">
      <Box>
        <Box mb={1}>
          <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
            Points: {initialPoints}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              wordBreak: "break-word",
              lineHeight: 1.5,
              paddingRight: 1,
            }}
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

        {/* ✅ Keep chips as-is */}
        <Box mb={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {correctAnswers.map((a, index) => (
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

        {wordList.length > 0 && (
          <Box mt={4} sx={{display: "flex", justifyContent: "center" }}>
            <svg ref={svgRef} />
          </Box>
        )}
      </Box>
    </div>
  );
}
