import React, { useState } from "react";
import "./FRQ.css";
import Header from "../Components/Header";

interface FRQProps {
  question: { question: string; acceptedAnswers: string[] };
  onSubmit: (answer: string) => void;
}

const FRQ: React.FC<FRQProps> = ({ question, onSubmit }) => {
  const [answer, setAnswer] = useState("");

  return (
    <div className="frq-container">
      <Header/>
      <div className="frq-content">
        <div className="frq-question-box">
          <p className="question-text">{question.question}</p>
        </div>
        <textarea
          className="answer-box"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
        ></textarea>
        <button className="submit-button" onClick={() => onSubmit(answer)}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default FRQ;
