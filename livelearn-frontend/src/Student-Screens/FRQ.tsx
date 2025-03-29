

import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import "./FRQ.css"; // ✅ reuse same styles for layout & buttons

interface FRQProps {
  question: {
    question: string;
    acceptedAnswers: string[];
    image?: string;
  };
  onSubmit: (answer: string) => void;
}

const FRQ: React.FC<FRQProps> = ({ question, onSubmit }) => {
  const hasImage = !!question.image;
  const [input, setInput] = useState("");

  // Clear input when question changes
  useEffect(() => {
    setInput("");
  }, [question]);

  return (
    <div className="mcontainer">
      <Header />
      <div className={`main-container ${hasImage ? "has-image" : "no-image"}`}>
        <div className="frq-question-box">
          <p className="question-text">{question.question}</p>
        </div>

        {hasImage && (
          <div className="image-box">
            <img
              src={question.image}
              alt="Question visual"
              className="question-image"
            />
          </div>
        )}

        <div className="frq-input-box">
          <textarea
            className="frq-textarea"
            placeholder="Type your answer here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

      </div>
              <div className="button-row-bottom">
          <button
            className="next-btn"
            onClick={() => onSubmit(input.trim())}
            disabled={!input.trim()}
          >
            Submit
          </button>
        </div>
    </div>
  );
};

export default FRQ;

