// import Header from "../Components/Header";
// import "./LoadingScreen.css";

// interface FinalScreenProps {
//   score: number;
//   total: number;
// }

// const FinalScreen: React.FC<FinalScreenProps> = ({ score, total }) => {
//   return (
//     <div className="loading-container">
//       <Header />
//       <div className="default2">
//         {/* Enlarged Hourglass SVG */}
//         <svg width="600" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2zm0 20h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#6366F1" />
//           <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2z" fill="#6366F1" />
//           <path d="M6 22h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#FBBF24" />
//         </svg>

//         {/* Extra Large Loading Text */}
//         <p className="default3" style={{ fontSize: '3rem' }}>
//           Your Score: {score} / {total}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default FinalScreen;

import { useLocation } from "react-router-dom";
import Header from "../Components/Header";
import "./LoadingScreen.css";

const FinalScreen: React.FC = () => {
  const location = useLocation();
  const { score, total } = location.state || { score: 0, total: 0 };

  return (
    <div className="loading-container">
      <Header />
      <div className="default2">
        {/* Enlarged Hourglass SVG */}
        <svg width="600" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2zm0 20h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#6366F1" />
          <path d="M6 2h12v4a6 6 0 01-6 6 6 6 0 01-6-6V2z" fill="#6366F1" />
          <path d="M6 22h12v-4a6 6 0 00-6-6 6 6 0 00-6 6v4z" fill="#FBBF24" />
        </svg>

        {/* Extra Large Loading Text */}
        <p className="default3" style={{ fontSize: '3rem' }}>
          Your Score: {score} / {total}
        </p>
      </div>
    </div>
  );
};

export default FinalScreen;

