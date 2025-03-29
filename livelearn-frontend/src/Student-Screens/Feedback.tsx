import React from "react";
import { useLocation } from "react-router-dom";
import "./Result.css"; // Reusing your styled choice boxes
import Header from "../Components/Header";

interface FeedbackProps {
  question: {
    question: string;
    options: string[];
    image?: string;
  };
  onNext: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ question, onNext }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const userAnswer = params.get("answer") || "";
  const correctAnswer = params.get("correctAnswer") || "";
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
            <img
              src={question.image}
              alt="Question visual"
              className="result-question-image"
            />
          </div>
        )}

        <div className="result-choices-box">
          {question.options.map((option, index) => {
            let className = "result-choice";

            if (option === correctAnswer) {
              className += " correct-answer";
            } else if (option === userAnswer && userAnswer !== correctAnswer) {
              className += " incorrect-answer";
            }

            return (
              <div key={index} className={className}>
                {option}
              </div>
            );
          })}
        </div>


      </div>
        <div className="button-row-bottom">
          <button className="next-btn" onClick={onNext}>
            Next Question
          </button>
        </div>      
    </div>
  );
};

export default Feedback;
