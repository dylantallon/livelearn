import React from "react";
import "./Feedback.css";
import Header from "../Components/Header";


interface FeedbackProps {
  question: { type: "MCQ" | "FRQ"; question: string; answer?: string; acceptedAnswers?: string[] };
  onNext: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ question, onNext }) => {
  return (
    <div className="feedback-container">
      <Header/>
      <div className="feedback-section">
        <h1 className="answer">The correct answer was:</h1>
        <div className="feedback-box same-height-box">
          {question.type === "MCQ" ? question.answer : question.acceptedAnswers?.join(", ")}
        </div>
        <button className="next-btn" onClick={onNext}>Next Question</button>
      </div>
    </div>
  );
};

export default Feedback;
