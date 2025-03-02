import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Feedback.css"; // Create this file for styling

const Feedback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  
  const userAnswer = params.get("answer") || "No answer selected";
  const correctAnswer = "A"; // Set the correct answer here
  const isCorrect = userAnswer === correctAnswer;

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate("/MCQ"); // Redirect back to question page
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>LiveLearn</h1>
      </div>        
      <h1>{isCorrect ? "✅ Correct!" : "❌ Wrong!"}</h1>
      <p className="feedback-message">
        The correct answer was: <strong>{correctAnswer}</strong>
      </p>
      <p className="countdown-text">next question in {countdown} seconds...</p>
    </div>
  );
};

export default Feedback;