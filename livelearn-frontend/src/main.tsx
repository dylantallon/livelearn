import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingScreen from './Student-Screens/LoadingScreen.tsx';
import MCQ from './Student-Screens/MCQ.tsx';
import Result from './Student-Screens/Result.tsx';
import Feedback from './Student-Screens/Feedback.tsx';
import Start from './Start.tsx'
import Poll from './Teacher-Screens/Poll.tsx'
import Score from './Teacher-Screens/Score.tsx';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/poll" element={<Poll />} />
      <Route path="/scores" element={<Score />} />
      
      <Route path="/loading" element={<LoadingScreen />} />
      <Route path="/MCQ" element={<MCQ />} />
      <Route path="/Result" element={<Result />} /> 
      <Route path="/FeedBack" element={<Feedback />} /> 
    </Routes>
  </Router>
)
