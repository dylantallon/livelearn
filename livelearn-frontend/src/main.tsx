import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingScreen from './Student-Screens/LoadingScreen.tsx';
import MCQ from './Student-Screens/MCQ.tsx';
import Result from './Student-Screens/Result.tsx';
import Feedback from './Student-Screens/Feedback.tsx';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <Router>
  <Routes>
    <Route path="/" element={<LoadingScreen />} />  {/* Main Page */}
    <Route path="/MCQ" element={<MCQ />} />  {/* Main Page */}
    <Route path="/Result" element={<Result />} /> 
    <Route path="/FeedBack" element={<Feedback />} /> 
  </Routes>
</Router>
)
