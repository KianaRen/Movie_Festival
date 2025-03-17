import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/MovieDetail.css";
import { AuthContext } from '../context/AuthContext';

function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [error, setError] = useState(null);
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`/api/movies/${id}`)
            .then((response) => {
                setMovie(response.data);
            })
            .catch((error) => {
                console.error("Error fetching movie details:", error);
                setError("Movie not found!!!");
            });

        // Fetch user's lists
        axios.get("/api/mylist/grouped")
            .then((response) => {
                const listData = Object.entries(response.data).map(([listId, list]) => ({
                    listId, 
                    listTitle: list.listTitle
                }));
                setLists(listData);
            })
            .catch((error) => {
                console.error("Error fetching lists:", error);
            });

    }, [id]);

    const onListBtnClick = async () => {
        if (!user) {
            alert("Please login first!");
            return;
        }

        if (!selectedListId) {
            alert("Please select a list first!");
            return;
        }

        try {
            const response = await axios.post("/api/mylist/add", {
                list_id: selectedListId,
                movie_id: movie.movieId,
            });

            if (response.status === 200) {
                alert("Movie added successfully!");
            }
        } catch (error) {
            console.error("Error adding movie:", error);
            alert("Failed to add movie.");
        }
    };

    const handleDropdownClick = (e) => {
        if (!user) {
            alert("Please login first!");
            e.preventDefault();  
        }
    };

    if (error) return <p>{error}</p>;
    if (!movie) return <p>Loading movie details...</p>;

    return (
        <div className="movie-detail">
            <div className="title-section">
                <h1>{movie.title} ({movie.releaseYear})</h1>
                <div className="add-to-list">
                    <select onChange={(e) => setSelectedListId(e.target.value)} className="list-select" onClick={handleDropdownClick} disabled={!user}>
                        <option value="">Select a list</option>
                        {lists.map((list) => (
                            <option key={list.listId} value={list.listId}>
                                {list.listTitle}
                            </option>
                        ))}
                    </select>
                    <button onClick={onListBtnClick} className="list-btn">ADD TO LIST</button>
                </div>
            </div>
            
            <div className="movie-content">
                {/* Left: Poster */}
                <div className="movie-poster">
                    <img src={movie.posterURL} alt={movie.title} />
                </div>

                {/* Right: Movie Details */}
                <div className="movie-info">
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
            </div>
        </div>
    );
}

export default MovieDetail;
