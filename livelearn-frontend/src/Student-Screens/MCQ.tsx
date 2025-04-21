import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./MCQ.css";
import Header from "../Components/Header";

interface MCQProps {
  question: { question: string; options: string[]; image?: string };
  onAnswer: (answer: string) => void;
}

const MCQ: React.FC<MCQProps> = ({ question, onAnswer }) => {
  const hasImage = !!question.image;
  const [selected, setSelected] = useState<string>("");
  const location = useLocation();
  const isDisplay = location.pathname === "/display";

  useEffect(() => {
    setSelected("");
  }, [question]);

  return (
    <>
      <Header /> 
    <div className="mcontainer">
      <div className={`main-container ${hasImage ? "has-image" : "no-image"}`}>
        <div className="question-box">
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

        <div className="choices-box">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`choice ${selected === option ? "result-selected-answer" : ""} ${
                isDisplay ? "disabled-choice" : ""
              }`}
              onClick={() => !isDisplay && setSelected(option)}
              style={{ pointerEvents: isDisplay ? "none" : "auto" }}
            >
              {option}
            </div>
          ))}
        </div>

        {!isDisplay && (
          <div className="button-row-bottom">
            <button
              className="next-btn"
              onClick={() => onAnswer(selected)}
              disabled={!selected}
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

export default MCQ;
