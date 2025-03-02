import React from "react";
import { useNavigate } from "react-router-dom";
import "./MCQ.css"; // Import your styles

const MCQ: React.FC = () => {
  const navigate = useNavigate(); // React Router navigation hook

  // Function to handle choice selection
  const handleChoiceClick = (choice: string) => {
    navigate(`/result?answer=${choice}`); // Pass the selected answer to result page
  };

  return (
    <div className="main-container">
      <div className="MCQ-header">
        <h1>LiveLearn</h1>
      </div>
      {/* Question Box */}
      <div className="question-box">
        <p className="question-text">Question...</p>
      </div>

      {/* Choices Box */}
      <div className="choices-box">
        {["A", "B", "C", "D"].map((option, index) => (
          <div key={index} className="choice" onClick={() => handleChoiceClick(option)}>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCQ;
