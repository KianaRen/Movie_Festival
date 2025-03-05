import { Link } from 'react-router-dom';
import '../css/MovieCard.css';

function MovieListCard({ movie, onRemove }) {
    return (
        <div className="movie-card">
            {/* Remove button (X) in the top-right corner */}
            <button 
                className="remove-button"
                onClick={(e) => { 
                    e.preventDefault(); // Prevent navigation when clicking "X"
                    onRemove(); 
                }}
            >
                ✖
            </button>

            <Link to={`/dashboard/${movie.movieId}`} className="movie-link">
                <div className="movie-poster">
                    <img src={movie.posterURL} alt={movie.title} />
                </div>
            </Link>

            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.releaseYear}</p>
                <p>{movie.criticScore}</p>
            </div>
        </div>
    );
}

export default MovieListCard;
