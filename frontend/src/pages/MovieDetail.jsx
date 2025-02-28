import { useEffect , useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function MovieDetail(){
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/movies/${id}`)
            .then((response) => {
                setMovie(response.data);
            })
            .catch((error) => {
                console.error("Error fetching movie details:", error);
                setError("Movie not found!!!");
            });
    }, [id]);

    if (error) return <p>{error}</p>;
    if (!movie) return <p>Loading movie details...</p>;

    return (
        <div className="movie-detail">
            <h1>{movie.title} ({movie.releaseYear})</h1>
            <img src={movie.posterURL} alt={movie.title} />
            <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
            <p><strong>Description:</strong> {movie.overview || "No description available."}</p>
            
            {movie.directorName && <p><strong>Director:</strong> {movie.directorName}</p>}
            
            {movie.stars && movie.stars.length > 0 && (
                <p><strong>Stars:</strong> {movie.stars.join(", ")}</p>
            )}
    
            {movie.genres && movie.genres.length > 0 && (
                <p><strong>Genres:</strong> {movie.genres.join(", ")}</p>
            )}
    
            {movie.tags && movie.tags.length > 0 && (
                <p><strong>Tags:</strong> {movie.tags.join(", ")}</p>
            )}
        </div>
    );
}

export default MovieDetail