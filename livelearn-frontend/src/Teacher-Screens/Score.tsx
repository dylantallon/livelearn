import "./Score.css";
import { useNavigate } from 'react-router-dom';

function Score() {
    const navigate = useNavigate();

    const students = [
        { id: 1, name: 'Student Name', score: '10/10' },
        { id: 2, name: 'Student Name', score: '10/10' },
        { id: 3, name: 'Student Name', score: '10/10' },
        { id: 4, name: 'Student Name', score: '10/10' },
        { id: 5, name: 'Student Name', score: '10/10' },
        { id: 6, name: 'Student Name', score: '10/10' },
        { id: 7, name: 'Student Name', score: '10/10' },
        { id: 8, name: 'Student Name', score: '10/10' },
        { id: 9, name: 'Student Name', score: '10/10' },
        { id: 10, name: 'Student Name', score: '10/10' },
        { id: 11, name: 'Student Name', score: '10/10' },
        { id: 12, name: 'Student Name', score: '10/10' },
        { id: 13, name: 'Student Name', score: '10/10' },
        { id: 14, name: 'Student Name', score: '10/10' },
        { id: 15, name: 'Student Name', score: '10/10' },
        { id: 16, name: 'Student Name', score: '10/10' },
        { id: 17, name: 'Student Name', score: '10/10' },
        { id: 18, name: 'Student Name', score: '10/10' },
        { id: 19, name: 'Student Name', score: '10/10' },
        { id: 20, name: 'Student Name', score: '10/10' },
      ];

    const handleBackClick = () => {
      navigate(-1);
    };
  
    return (
      <div className="app-container">
        <h1 className="title">LiveLearn</h1>
        <div className = "back-div" >
            <button className="btn-back" onClick={handleBackClick}>⟵</button>
        </div>
        <div className="score-list">
          {students.map((student) => (
            <div key={student.id} className="survey-row">
              <div className="student-name">
                {student.name}
              </div>
              <div className="student-score">
                Score: {student.score} 
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default Score;
  