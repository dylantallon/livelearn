import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Survey from './Student-Pages/Survey.tsx'
import Score from './Student-Pages/Score.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Survey />} />
      <Route path="/scores" element={<Score />} />
    </Routes>
  </Router>
)
