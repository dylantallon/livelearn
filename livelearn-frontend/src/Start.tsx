import "./Start.css";
import { useNavigate } from 'react-router-dom';

function Start() {
    const navigate = useNavigate();

    const handleTeacherClick = () => {
      navigate('/poll');
    };

    const handleStudentClick = () => {
        navigate('/loading');
      };
  
    return (
      <div className="app-container">
        <div className = "button-div" >
            <button onClick={handleTeacherClick}> Teacher Side </button>
            <button onClick={handleStudentClick}> Student Side </button>
        </div>
      </div>
    );
  }
  
  export default Start;
  