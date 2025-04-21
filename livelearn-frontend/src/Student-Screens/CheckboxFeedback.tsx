import React from "react";
import Header from "../Components/Header";
import "./Result.css";

interface CheckboxFeedbackProps {
  question: { question: string; options: string[]; image?: string; answers: string[] };
  userAnswer: string[];
  onNext: () => void;
}

const CheckboxFeedback: React.FC<CheckboxFeedbackProps> = ({ question, userAnswer}) => {
  const hasImage = !!question.image;

  return (
    <>
    <Header />
    <div className="result-main">
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
            const isCorrect = question.answers.includes(option);
            const isSelected = userAnswer.includes(option);

            let className = "result-choice";
            if (isCorrect && isSelected) className += " correct-answer";
            else if (!isCorrect && isSelected) className += " incorrect-answer";
            else if (isCorrect) className += " correct-answer";

            return (
              <div key={index} className={className}>
                {option}
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="button-row-bottom">
        <button className="next-btn" onClick={onNext}>
          Next Question
        </button>
      </div> */}
    </div>
    </>
  );
};

export default CheckboxFeedback;
