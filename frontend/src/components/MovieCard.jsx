import { Link } from 'react-router-dom'
import '../css/MovieCard.css'
import axios from "axios";

function MovieCard({movie}){

    async function onListBtnClick(event) {
        event.preventDefault(); 
    
        try {
          await axios.post("/api/mylist/add", {
            movie_id: movie.movieId,
          });
          //alert("Movie added to your list!"); 
        } catch (error) {
          console.error("Error adding movie:", error);
          alert("Failed to add movie. Please try again.");
        }
      }

    return <div className="movie-card">
        <Link to={`/dashboard/${movie.movieId}`} className="movie-link">
        <div className="movie-poster">
            <img src = {movie.posterURL} alt = {movie.title}/>
            <div className="movie-overlay">
                <button className="list-btn" onClick={onListBtnClick}>ADD TO LIST</button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.releaseYear}</p>
            <p>{movie.criticScore}</p>
        </div>
        </Link>
    </div>

}

export default MovieCard