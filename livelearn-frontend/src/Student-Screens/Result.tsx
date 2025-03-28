import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Result.css";
import Header from "../Components/Header";

interface ResultProps {
  onShowAnswer: () => void;
  onNext: () => void;
}

const Result: React.FC<ResultProps> = ({ onShowAnswer, onNext }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userAnswer = params.get("answer") || "No answer selected";
  const correctAnswer = params.get("correctAnswer") || "Answer not available";
  //const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="result-container">
      <Header />
      <div className="answer-section">
        <h1 className="answer-text">You answered:</h1>
        <div className="answer-box">{userAnswer}</div>


        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
  <button className="next-btn" onClick={onShowAnswer}>
    Show Answer
  </button>
  <button className="next-btn" onClick={onNext}>
    Next Question
  </button>
</div>
      </div>
    </div>
  );
};

export default Result;
