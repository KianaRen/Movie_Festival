import { useEffect , useState} from "react";
import { useParams } from "react-router-dom";

function MovieDetail(){
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        fetch("/movies.json")
            .then((response) => response.json())
            .then((data) => {
                const selectedMovie = data.find((m) => m.id === parseInt(id)); // Find movie by ID
                setMovie(selectedMovie);
            })
            .catch((error) => console.error("Error fetching movie details:", error));
    }, [id]);

    if (!movie) return <p>Loading movie details...</p>;

    return (
        <div className="movie-detail">
            <h1>{movie.title} ({movie.year})</h1>
            <img src={movie.url} alt={movie.title} />
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Description:</strong> {movie.description || "No description available."}</p>
        </div>
    )
}

export default MovieDetail