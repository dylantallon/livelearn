import React from "react";
import { useNavigate } from 'react-router-dom';
import "./Poll.css";

function Poll() {
  const navigate = useNavigate();

  const surveys = [
    { id: 1, title: "Survey 1", questions: 10 },
    { id: 2, title: "Survey 2", questions: 10 },
    { id: 3, title: "Survey 3", questions: 10 },
    { id: 4, title: "Survey 4", questions: 10 },
    { id: 5, title: "Survey 5", questions: 10 },
    { id: 6, title: "Survey 6", questions: 10 },
    { id: 7, title: "Survey 7", questions: 10 },
    { id: 8, title: "Survey 8", questions: 10 },
    { id: 9, title: "Survey 9", questions: 10 },
    { id: 10, title: "Survey 10", questions: 10 },
    { id: 11, title: "Survey 11", questions: 10 },
    { id: 12, title: "Survey 12", questions: 10 }
  ];

  const handleScoreClick = () => {
    navigate('/scores');
  };

  return (
    <div className="app-container">
      <h1 className="title">LiveLearn</h1>
      <p className="subtitle">
        Click on a poll and press start session to begin a session
      </p>

      <div className="survey-list">
        {surveys.map((survey) => (
          <div key={survey.id} className="survey-row">
            <div className="survey-name">
              {survey.title}
            </div>
            <div className="survey-questions">
              {survey.questions} Questions
            </div>
            <div className="survey-actions">
              <button className="btn-delete">Delete</button>
              <button className="btn-edit">Edit Poll</button>
              <button onClick={handleScoreClick} className="btn-view-scores">View Scores</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-buttons">
        <button className="btn-new-survey">+ New Survey</button>
        <button className="btn-start-session">Start Session</button>
      </div>
    </div>
  );
}

export default Poll;
