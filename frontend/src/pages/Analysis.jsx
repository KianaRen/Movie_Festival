import { Link } from "react-router-dom";
import "../css/Analysis.css";

function Analysis() {
  return (
    <div className="analysisContainer">
      <div className="buttonContainer">
        <Link to="/audience-rating" className="analysisButton">
          Audience Rating Patterns
        </Link>
        
        <Link to="/predict-ratings" className="analysisButton">
          Predict Ratings
        </Link>
        
        <Link to="/viewer-personality" className="analysisButton">
          Viewer Personality
        </Link>
      </div>
    </div>
  );
}

export default Analysis;