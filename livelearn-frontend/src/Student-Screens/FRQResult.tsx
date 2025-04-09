import React from "react";
import Header from "../Components/Header";
import "./FRQ.css";

interface FRQResultProps {
  question: { question: string; acceptedAnswers: string[]; image?: string };
  userAnswer: string;
  onNext: () => void;
  onShowAnswer: () => void; // ✅ Add this
}

const FRQResult: React.FC<FRQResultProps> = ({ question, userAnswer}) => {
  const hasImage = !!question.image;

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
          <div className="frq-result-answer-box">{userAnswer}</div>
        </div>
      </div>

      {/* <div className="button-row-bottom">
        <button className="next-btn" onClick={onShowAnswer}>
          Show Answer
        </button>
        <button className="next-btn" onClick={onNext}>
          Next Question
        </button>
      </div> */}
    </div>
  );
};

export default FRQResult;
