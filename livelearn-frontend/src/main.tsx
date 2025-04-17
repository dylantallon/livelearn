import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext.tsx";

import ProtectedRoute from "./Components/ProtectedRoute.tsx";
import Start from "./Start.tsx";
import Poll from "./Teacher-Screens/Poll.tsx";
import Score from "./Teacher-Screens/Score.tsx";
import Edit from "./Teacher-Screens/Edit.tsx";
import Session from "./Teacher-Screens/Session.tsx";
//import LoadingScreen from "./Student-Screens/LoadingScreen.tsx";
import FinalScreen from "./Student-Screens/FinalScreen.tsx";
import TestPoll from "./Student-Screens/testPoll.tsx";
import StudentScreen from "./Student-Screens/StudentScreen.tsx";

import "./index.css";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route element={<ProtectedRoute requiredRole="Instructor"/>}>
          <Route path="/poll" element={<Poll />} />
          <Route path="/scores" element={<Score />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/session" element={<Session />} />
          <Route path="/display" element={<StudentScreen />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="Learner"/>}>
          <Route path="/quiz" element={<StudentScreen />} />
          <Route path="/finished" element={<FinalScreen />} />
        </Route>
        <Route path="/testpoll" element={<TestPoll />} />
      </Routes>
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
