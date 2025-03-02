import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './Start.tsx'
import Poll from './Student-Pages/Poll.tsx'
import Score from './Student-Pages/Score.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/poll" element={<Poll />} />
      <Route path="/scores" element={<Score />} />
    </Routes>
  </Router>
)
