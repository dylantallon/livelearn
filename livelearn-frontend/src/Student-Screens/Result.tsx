import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Result.css";

interface ResultProps {
  onShowAnswer: () => void;
}

const Result: React.FC<ResultProps> = ({ onShowAnswer }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userAnswer = params.get("answer") || "No answer selected";
  const correctAnswer = params.get("correctAnswer") || "Answer not available";
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="result-container">
      <div className="Result-header">
        <h1>LiveLearn</h1>
      </div>
      <div className="answer-section">
        <h1 className="answer-text">You answered:</h1>
        <div className="answer-box">{userAnswer}</div>
        {showAnswer && <p className="correct-answer">Correct answer: {correctAnswer}</p>}
        <button className="next-btn" onClick={() => { setShowAnswer(true); onShowAnswer(); }}>
          Show Answer
        </button>
      </div>
    </div>
  );
};

export default Result;
