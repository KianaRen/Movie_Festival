import { Link } from 'react-router-dom';
import '../css/MovieCard.css';
import axios from "axios";

function MovieListCard({ movie, onDelete }) {

    return (
        <div className="movie-card">
            <Link to={`/dashboard/${movie.movieId}`} className="movie-link">
                <div className="movie-poster">
                    <img src={movie.posterURL} alt={movie.title} />
                    <div className="movie-overlay">
                    
                    </div>
                </div>
                <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>{movie.releaseYear}</p>
                    <p>{movie.criticScore}</p>
                </div>
            </Link>
        </div>
    );
}

export default MovieListCard;
