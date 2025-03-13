import "./Start.css";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";

import { getDoc, doc } from "firebase/firestore";
import { signInWithCustomToken } from "firebase/auth";
import { auth, db } from "./firebase";

function Start() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Loading...");

    const login = async () => {
      try {
        let user = null;
        const token = searchParams.get("token");
        if (token) {
          const credential = await signInWithCustomToken(auth, token);
          user = credential.user;
        }
        else if (auth.currentUser) {
          user = auth.currentUser;
        }
        if (!user) {
          throw new Error("User is null");
        }

        const tokenResult = await user.getIdTokenResult();
        const courseId = tokenResult.claims.courseId;
        if (typeof courseId !== "string") {
          throw new Error("Course ID is null");
        }
        const course = await getDoc(doc(db, "courses", courseId));
        if (course.exists()) {
          if (course.data().instructors?.includes(user.uid)) {
            navigate('/poll');
          }
          else {
            navigate('/loading');
          }
        }
        else {
          throw new Error("Course does not exist");
        }
      }
      catch (error) {
        console.error(error);
        if (error instanceof Error) {
          setMessage(error.message);
        }
      }
    };

    useEffect(() => {
      login();
    }, []);
  
    return (
      <div className="app-container">
        <div className = "button-div" >
          <span>{message}</span>
        </div>
      </div>
    );
  }
  
  export default Start;
  