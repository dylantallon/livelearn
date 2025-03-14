import React from "react";
import "./Feedback.css";

interface FeedbackProps {
  question: { type: "MCQ" | "FRQ"; question: string; answer?: string; acceptedAnswers?: string[] };
  onNext: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ question, onNext }) => {
  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>LiveLearn</h1>
      </div>
      <div className="feedback-section">
        <h1 className="answer">The correct answer was:</h1>
        <div className="feedback-box">
          {question.type === "MCQ" ? question.answer : question.acceptedAnswers?.join(" or ")}
        </div>
        <button className="next-btn" onClick={onNext}>Next Question</button>
      </div>
    </div>
  );
};

export default Feedback;
