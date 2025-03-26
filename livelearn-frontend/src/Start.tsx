import "./Start.css";
import { Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useContext } from "react";
import { signInWithCustomToken } from "firebase/auth";
import CircularProgress from '@mui/material/CircularProgress';

import { auth } from "./firebase";
import { AuthContext } from "./Components/AuthContext";

function Start() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState<string | null>(null);
    const {role, error} = useContext(AuthContext);

    // Check if token is in URL to log in user
    const login = async () => {
      try {
        const token = searchParams.get("token");
        if (token) {
          localStorage.setItem("token", token);
          await signInWithCustomToken(auth, token);
        }
      }
      catch (error) {
        console.error(error);
        if (error instanceof Error) {
          setLoginError(error.message);
        }
      }
      setLoading(false);
    };

    useEffect(() => {
      login();
    }, []);

    // Redirect user as soon as login is finished
    if (!loading) {
      if (role === "Instructor") {
        return <Navigate to="/poll" replace/>
      }
      if (role === "Learner") {
        return <Navigate to="/loading" replace/>
      }
    }

    // Display any errors
    const message = searchParams.get("token") ? loginError : error;
  
    return (
      <div className="app-container">
        <div className = "message-div" >
          {message ? <span style={{color: "white"}}>{message}</span> : <CircularProgress size={50}/>}
        </div>
      </div>
    );
  }
  
  export default Start;
  