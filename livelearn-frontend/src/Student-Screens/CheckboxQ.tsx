import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../Components/Header";
import "./MCQ.css";

interface CheckboxProps {
  question: {
    question: string;
    options: string[];
    image?: string;
  };
  onSubmit: (answers: string[]) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ question, onSubmit }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const location = useLocation();
  const isDisplay = location.pathname === "/display";

  useEffect(() => {
    setSelected([]); // reset when question changes
  }, [question]);

  const toggleOption = (option: string) => {
    if (isDisplay) return;
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  return (
    <>
      <Header />
      <div className="mcontainer">
        <div className={`main-container ${question.image ? "has-image" : "no-image"}`}>
          <div className="question-box">
            <p className="question-text">{question.question}</p>
          </div>

          {question.image && (
            <div className="image-box">
              <img src={question.image} alt="Question visual" className="question-image" />
            </div>
          )}

          <div className="choices-box">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`choice ${selected.includes(option) ? "result-selected-answer" : ""} ${
                  isDisplay ? "disabled-choice" : ""
                }`}
                onClick={() => toggleOption(option)}
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
                onClick={() => onSubmit(selected)}
                disabled={selected.length === 0}
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

export default Checkbox;
