import React from "react";
import Header from "../Components/Header";
import "./Result.css";

interface CheckboxResultProps {
  question: { question: string; options: string[]; image?: string };
  userAnswer: string[];
  onShowAnswer: () => void;
  onNext: () => void;
}

const CheckboxResult: React.FC<CheckboxResultProps> = ({ question, userAnswer, onShowAnswer, onNext }) => {
  const hasImage = !!question.image;

  return (
    <div className="result-main">
      <Header />
      <div className={`result-container ${hasImage ? "has-image" : "no-image"}`}>
        <div className="result-question-box">
          <p className="result-question-text">{question.question}</p>
        </div>

        {hasImage && (
          <div className="result-image-box">
            <img src={question.image} alt="Question visual" className="result-question-image" />
          </div>
        )}

        <div className="result-choices-box">
          {question.options.map((option, index) => {
            const isSelected = userAnswer.includes(option);
            const className = isSelected ? "result-choice result-selected-answer" : "result-choice";
            return (
              <div key={index} className={className}>
                {option}
              </div>
            );
          })}
        </div>
      </div>

      <div className="result-button-row">
        <button className="next-btn" onClick={onShowAnswer}>
          Show Answer
        </button>
        <button className="next-btn" onClick={onNext}>
          Next Question
        </button>
      </div>
    </div>
  );
};

export default CheckboxResult;
