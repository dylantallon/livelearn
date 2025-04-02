import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import "./FRQ.css";

interface FRQProps {
  question: {
    question: string;
    acceptedAnswers: string[];
    image?: string;
  };
  onSubmit: (answer: string) => void;
  onShowAnswer: () => void;
  onNext: () => void;
}

const FRQ: React.FC<FRQProps> = ({ question, onSubmit, onShowAnswer,onNext }) => {
  const hasImage = !!question.image;
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Reset input and submission state on question change
  useEffect(() => {
    setInput("");
    setSubmitted(false);
  }, [question]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setSubmitted(true);
    }
  };

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
        {!submitted ? (
          <button
            className="next-btn"
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            Submit
          </button>
        ) : (
          <>
            <button className="next-btn" onClick={onShowAnswer}>
              Show Answer
            </button>
            <button className="next-btn" onClick={onNext}>
              Next Question
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FRQ;
