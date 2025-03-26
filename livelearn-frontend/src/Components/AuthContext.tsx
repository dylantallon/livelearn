import { createContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

import { db, auth } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  role: string;
  courseId: string;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  role: "",
  courseId: "",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          throw new Error("User is null");
        }
        // Get current course ID
        const tokenResult = await currentUser.getIdTokenResult();
        const courseId = tokenResult.claims.courseId;
        if (typeof courseId !== "string") {
          throw new Error("Course ID is null");
        }
        setCourseId(courseId);

        // Get current user role
        const course = await getDoc(doc(db, "courses", courseId));
        if (course.exists()) {
          if (course.data().instructors?.includes(currentUser.uid)) {
            setRole("Instructor");
          }
          else {
            setRole("Learner");
          }
        }
        else {
          throw new Error("Course does not exist");
        }
        setUser(currentUser);
      }
      catch (error) {
        console.error(error);
        if (error instanceof Error) {
          setError(error.message);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, role, courseId }}>
      {children}
    </AuthContext.Provider>
  );
};
