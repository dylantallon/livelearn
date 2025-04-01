import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import "./Poll.css";
import Header from '../Components/Header';

import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

import { AuthContext } from "../Components/AuthContext";
import { ConfirmationDialog } from "./Components/Confirmation";

function Poll() {
  interface Question {
    id: string;
    type: "checkbox" | "radio" | "text";
    title: string;
    choices: string[];
  }

  interface Poll {
    id: string;
    title: string;
    courseId: string;
    questions: Question[];
  }

  const navigate = useNavigate();
  const { courseId } = useContext(AuthContext);

  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!courseId) return;

      try {
        const pollsRef = collection(db, "polls");
        const q = query(pollsRef, where("courseId", "==", courseId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Poll[];
        setPolls(data);
      } catch (err) {
        console.error("Failed to load surveys:", err);
      }
    };

    fetchPolls();
  }, [courseId]);

  const handleAddPoll = async () => {
    if (!courseId) return;

    const newPoll = {
      title: `New Poll`,
      questions: [],
      courseId: courseId,
    };

    try {
      const docRef = await addDoc(collection(db, "polls"), newPoll);
      setPolls([...polls, { id: docRef.id, ...newPoll }]);
    } catch (err) {
      console.error("Failed to add poll:", err);
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteDoc(doc(db, "polls", id));
      setPolls((prev) => prev.filter((s) => s.id !== id));
      if (selectedPollId === id) setSelectedPollId(null);
    } catch (err) {
      console.error("Failed to delete poll:", err);
    }
  };

  const handleScoreClick = () => navigate('/scores');

  const handleEditClick = (poll: Poll) => {
    navigate('/edit', { state: { pollId: poll.id } });
  };

  const handleStartSession = () => {
    if (selectedPollId) {
      navigate('/session', { state: { pollId: selectedPollId } });
    }
  };

  const handleRowClick = (id: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (event) {
      const target = event.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest(".MuiIconButton-root") ||
        target.closest("svg")
      ) return;
    }

    setSelectedPollId((prev) => (prev === id ? null : id));
  };

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest(".btn-delete") ||
      target.closest(".btn-edit") ||
      target.closest(".btn-view-scores") ||
      target.closest(".btn-start-session") ||
      target.closest(".btn-new-survey")
    ) return;

    if (!target.closest(".survey-row")) setSelectedPollId(null);
  };

  return (
    <div className="app-container" onClick={handleOutsideClick}>
      <Header />
      <div className="survey-list">
        <div className="top-buttons">
          <div className="subtitle">
            Click on a poll and press start session to begin a session
          </div>
          <div className="survey-buttons">
            <button onClick={handleAddPoll} className="btn-new-survey">
              <AddIcon fontSize='inherit' /> New Poll
            </button>
            <button onClick={handleStartSession} disabled={selectedPollId === null} className="btn-start-session">
              Start Session
            </button>
          </div>
        </div>
        {polls.length > 0 ? (
          polls.map((poll) => (
            <div
              key={poll.id}
              className={`survey-row ${selectedPollId === poll.id ? "selected" : ""}`}
              onClick={(e) => handleRowClick(poll.id, e)}
            >
              <div className="survey-name">{poll.title}</div>
              <div className="survey-questions">{poll.questions.length} Questions</div>
              <div className="survey-actions">
                <button onClick={() => handleEditClick(poll)} className="btn-edit">
                  <EditIcon fontSize='inherit' /> Edit
                </button>
                <button onClick={handleScoreClick} className="btn-view-scores">
                  View Scores
                </button>
                <ConfirmationDialog
                  onConfirm={() => handleDeleteClick(poll.id)}
                  title="Delete Poll"
                  description={`Are you sure you want to delete "${poll.title}"? This action cannot be undone.`}
                  trigger={
                    <button className="btn-delete">
                      <DeleteOutlineIcon fontSize='inherit' /> Delete
                    </button>
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-poll-state">
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
