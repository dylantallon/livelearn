import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingScreen.css"
import Header from "../Components/Header";

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/quiz"); // Redirects to another page after 10s
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-container">
      <Header/>
      <div className="default2">
        {/* Enlarged Hourglass SVG */}
        <svg width="600" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2zm0 20h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" 
            fill="#6366F1"/>
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2z" fill="#FBBF24"/>
          <path d="M6 22h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#6366F1"/>
        </svg>

        {/* Extra Large Loading Text */}
        <p 
          className="default3"
          style={{ fontSize: '3rem' }} // Extra large text
        >
          Wait for session to start…..
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;