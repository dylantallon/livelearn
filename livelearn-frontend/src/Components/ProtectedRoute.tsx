import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { CircularProgress } from "@mui/material";

import { AuthContext } from "./AuthContext";

interface ProtectedRouteProps {
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const { user, loading, error, role } = useContext(AuthContext);

  if (loading || error) {
    return (
      <div className="app-container">
        <div className = "message-div" >
          {error ? <span style={{color: "white"}}>{error}</span> : <CircularProgress size={50}/>}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace/>;
  };

  if (props.requiredRole === "Instructor" && role !== "Instructor") {
    return <Navigate to="/quiz" replace/>;
  }
  if (props.requiredRole === "Learner" && role !== "Learner") {
    return <Navigate to="/poll" replace/>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
