import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const userAnswer = params.get("answer") || "No answer selected";

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate(`/feedback?answer=${userAnswer}`); // Navigate to Feedback page with answer
    }

    return () => clearInterval(timer);
  }, [countdown, navigate, userAnswer]);

  return (
    <div className="result-container">
      <div className="Result-header">
        <h1>LiveLearn</h1>
      </div>
      <div className="answer-section">
        <h1 className="answer-text">You answered:</h1>
        <div className="answer-box">{userAnswer}</div>
        <p className="countdown-text">Checking answer in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default Result;