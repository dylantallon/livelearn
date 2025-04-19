import "./Score.css";
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from "../Components/Header";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";

interface StudentScore {
  name: string;
  score: string;
}

function Score() {
  const navigate = useNavigate();
  const location = useLocation();
  const pollId = location.state?.pollId;

  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchScores = async () => {
      if (!pollId) return;

      try {
        // Get total poll points
        const pollRef = doc(db, "polls", pollId);
        const pollSnap = await getDoc(pollRef);
        const totalPoints = pollSnap.data()?.points ?? 0;

        // Get all student documents in scores subcollection
        const scoresRef = collection(db, "polls", pollId, "scores");
        const scoreDocs = await getDocs(scoresRef);

        const studentScores: StudentScore[] = [];

        scoreDocs.forEach((docSnap) => {
          const data = docSnap.data();

          const earnedPoints = data.points ?? 0;

          studentScores.push({
            name: data.name, // Or replace with actual name field if stored
            score: `${earnedPoints}/${totalPoints}`
          });
        });

        setStudents(studentScores);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [pollId]);

  return (
    <div className="app-container">
      <Header />
      <ArrowBackIcon className="btn-back" onClick={handleBackClick} />
      <div className="score-list">
        {!loading && students.length > 0 ? (
          students.map((student) => (
            <div className="survey-score-row" key={student.name}>
              <div className="student-name">
                {student.name}
              </div>
              <div className="student-score">
                Score: {student.score}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-poll-state">
            <Typography variant="body1" color="text.secondary" sx={{ my: 4 }}>
              {loading ? "Loading..." : "No scores available at this time."}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

export default Score;
