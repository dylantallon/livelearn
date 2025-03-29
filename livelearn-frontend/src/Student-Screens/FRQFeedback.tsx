import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../Components/Header";
import "./FRQ.css";

interface FRQFeedbackProps {
  question: {
    type: "FRQ";
    question: string;
    acceptedAnswers: string[];
    image?: string;
  };
  onNext: () => void;
}

const FRQFeedback: React.FC<FRQFeedbackProps> = ({ question, onNext }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userAnswer = params.get("answer") || "";

  const isCorrect = question.acceptedAnswers.some(
    (ans) => ans.trim().toLowerCase() === userAnswer.trim().toLowerCase()
  );

  return (
    <div className="mcontainer">
      <Header />
      <div className={`main-container ${question.image ? "has-image" : "no-image"}`}>
        <div className="frq-question-box">
          <p className="question-text">{question.question}</p>
        </div>

        {question.image && (
          <div className="image-box">
            <img
              src={question.image}
              alt="Question visual"
              className="question-image"
            />
          </div>
        )}

        <div className="frq-input-box">
            <div className="frq-feedback-boxes">
            <div className={`frq-feedback-answer-box ${isCorrect ? "frq-correct" : "frq-incorrect"}`}>
                {userAnswer}
            </div>

            {!isCorrect && (
                <div className="frq-correct-answer-box">
                    <strong>Correct Answer{question.acceptedAnswers.length > 1 ? "s" : ""}:</strong> {question.acceptedAnswers.join(", ")}
                </div>
            )}
            </div>
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

export default FRQFeedback;
