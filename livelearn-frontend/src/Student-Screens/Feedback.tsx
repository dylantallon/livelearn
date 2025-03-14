// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./Feedback.css"; // Create this file for styling

// const Feedback: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const params = new URLSearchParams(location.search);
  
//   const userAnswer = params.get("answer") || "No answer selected";
//   const correctAnswer = "A"; // Set the correct answer here
//   const isCorrect = userAnswer === correctAnswer;

//   const [countdown, setCountdown] = useState(5);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCountdown((prev) => prev - 1);
//     }, 100000);

//     if (countdown === 0) {
//       navigate("/MCQ"); // Redirect back to question page
//     }

//     return () => clearInterval(timer);
//   }, [countdown, navigate]);

//   return (
//     <div className="feedback-container">
//       <div className="feedback-header">
//         <h1>LiveLearn</h1>
//       </div>        
//       <h1 className="answer"> {isCorrect ? "✅ Correct!" : "❌ Wrong!"}</h1>
//       <p className="feedback-message">
//         The correct answer was: <strong>{correctAnswer}</strong>
//       </p>
//       <p className="countdown-text">next question in {countdown} seconds...</p>
//     </div>
//   );
// };

// export default Feedback;

import React from "react";
import { useLocation } from "react-router-dom";
import "./Feedback.css";

interface FeedbackProps {
  onNext: () => void;
}

const questions = [
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What is 3 + 5?", answer: "8" },
  { question: "What is 10 - 6?", answer: "4" },
];

const Feedback: React.FC<FeedbackProps> = ({ onNext }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const questionIndex = parseInt(params.get("questionIndex") || "0", 10);

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>LiveLearn</h1>
      </div>
      <div className="feedback-section">
      <h1 className="answer">The correct answer was:</h1>
      <div className="feedback-box">{questions[questionIndex].answer}</div>
      <button className="next-btn" onClick={onNext}>Next Question</button>
      </div>
    </div>
  );
};

export default Feedback;
