import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

const FRQ: React.FC<FRQProps> = ({ question, onSubmit,}) => {
  const hasImage = !!question.image;
  const [input, setInput] = useState("");
  const [, setSubmitted] = useState(false);
  const location = useLocation();
  const isDisplay = location.pathname === "/display";

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
    <>
      <Header />
    <div className="mcontainer">

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
            disabled={isDisplay}
          />
        </div>

        {!isDisplay && (
          <div className="button-row-bottom">
              <button
                className="next-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                Submit
              </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FRQ;
