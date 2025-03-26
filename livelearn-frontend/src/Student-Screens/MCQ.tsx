
import React from "react";
import "./MCQ.css"; 
import Header from "../Components/Header";

interface MCQProps {
  question: { question: string; options: string[] };
  onAnswer: (answer: string) => void;
}

const MCQ: React.FC<MCQProps> = ({ question, onAnswer }) => {
  return (
    <div className="mcontainer">
      <Header/>
      <div className="main-container">
        <div className="question-box">
          <p className="question-text">{question.question}</p>
        </div>
        <div className="choices-box">
          {question.options.map((option, index) => (
            <div key={index} className="choice" onClick={() => onAnswer(option)}>
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCQ;

