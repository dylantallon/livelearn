import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Typography } from '@mui/material';
import EditIcon from "@mui/icons-material/Edit"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import AddIcon from "@mui/icons-material/Add"
import "./Poll.css";

function Poll() {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([
    { id: 1, title: "Poll 1", questions: 10 },
    { id: 2, title: "Poll 2", questions: 10 },
    { id: 3, title: "Poll 3", questions: 10 },
    { id: 4, title: "Poll 4", questions: 10 },
    { id: 5, title: "Poll 5", questions: 10 },
  ]);

  const handleScoreClick = () => {
    navigate('/scores');
  };

  const handleEditClick = () => {
    navigate('/edit');
  };

  const handleDeleteClick = (id: number) => {
    setSurveys(surveys.filter((survey) => survey.id !== id))
  }

  const handleAddPoll = () => {
    const newId = surveys.length > 0 ? Math.max(...surveys.map((s) => s.id)) + 1 : 1
    const newPoll = {
      id: newId,
      title: `Poll ${newId}`,
      questions: 10,
    }
    setSurveys([...surveys, newPoll])
  }

  return (
    <div className="app-container">
      <h1 className="title">LiveLearn</h1>
      <div className="survey-list">
      <div className="top-buttons">
        <div className="subtitle">
        Click on a poll and press start session to begin a session
        </div>
        <div className="survey-buttons">
          <button onClick={handleAddPoll} className="btn-new-survey"><AddIcon fontSize='inherit'/> New Poll</button>
          <button className="btn-start-session">Start Session</button>
        </div>
      </div>
        {/* {surveys.map((survey) => (
          <div key={survey.id} className="survey-row">
            <div className="survey-name">
              {survey.title}
            </div>
            <div className="survey-questions">
              {survey.questions} Questions
            </div>
            <div className="survey-actions">
              <button onClick={() => handleDeleteClick(survey.id)} className="btn-delete"><DeleteOutlineIcon fontSize='inherit'/> Delete</button>
              <button onClick={handleEditClick} className="btn-edit"><EditIcon fontSize='inherit'/> Edit</button>
              <button onClick={handleScoreClick} className="btn-view-scores">View Scores</button>
            </div>
          </div>
        ))} */}
                {surveys.length > 0 ? (
          surveys.map((survey) => (
            <div key={survey.id} className="survey-row">
              <div className="survey-name">{survey.title}</div>
              <div className="survey-questions">{survey.questions} Questions</div>
              <div className="survey-actions">
                <button onClick={() => handleDeleteClick(survey.id)} className="btn-delete"><DeleteOutlineIcon fontSize='inherit'/> Delete</button>
                <button onClick={handleEditClick} className="btn-edit"><EditIcon fontSize='inherit'/> Edit</button>
                <button onClick={handleScoreClick} className="btn-view-scores">View Scores</button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="empty-poll-state"
          >
            <Typography variant="body1" color="text.secondary" sx={{ my: 4 }}>
              No polls available. Click "New Poll" to create your first poll.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

export default Poll;
