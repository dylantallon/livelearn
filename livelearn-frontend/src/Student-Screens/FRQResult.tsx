import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import "./FRQ.css";

interface FRQResultProps {
  question: {
    question: string;
    acceptedAnswers: string[];
    image?: string;
  };
  onNext: () => void;
}

const FRQResult: React.FC<FRQResultProps> = ({ question, onNext }) => {
  const hasImage = !!question.image;
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const userAnswer = params.get("answer") || "";
  const questionIndex = params.get("questionIndex") || "0";

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
       <div className="button-row-bottom">
        <button
            className="next-btn"
            onClick={() =>
                navigate(`/FeedBackFRQ?answer=${encodeURIComponent(userAnswer)}&questionIndex=${questionIndex}`)
            }
            >
            Show Answer
        </button>
          <button className="next-btn" onClick={onNext}>
            Next Question
          </button>
        </div>
    </div>
  );
};

export default FRQResult;
