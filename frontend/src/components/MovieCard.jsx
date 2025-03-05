import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import axios from "axios";
import "../css/MovieCard.css";

const MovieCard = ({ movie }) => {
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState("");
    const navigate = useNavigate(); // React Router navigation function

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await axios.get("/api/mylist/grouped");
                setLists(Object.keys(response.data));
            } catch (error) {
                console.error("Error fetching lists:", error);
            }
        };
        fetchLists();
    }, []);

    const onListBtnClick = async (e) => {
        e.stopPropagation(); // Prevent clicking the movie poster
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
        e.stopPropagation(); // Prevent clicking the movie poster
    };

    const goToMovieDetail = () => {
        navigate(`/dashboard/${movie.movieId}`); // Navigate to movie detail page
    };

    return (
        <div className="movie-card" onClick={goToMovieDetail}>
            <div className="movie-poster">
                <img src={movie.posterURL} alt={movie.title} />
                {/* Movie actions (dropdown and button) */}
                <div className="movie-actions" onClick={(e) => e.stopPropagation()}>
                    <select className="list-select" onChange={(e) => setSelectedListId(e.target.value)} onClick={handleDropdownClick}>
                        <option value="">Select a list</option>
                        {lists.map((listId) => (
                            <option key={listId} value={listId}>
                                List {listId}
                            </option>
                        ))}
                    </select>
                    <button className="list-btn" onClick={onListBtnClick}>ADD TO LIST</button>
                </div>
            </div>

            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.releaseYear}</p>
                <p>{movie.criticScore}</p>
            </div>
        </div>
    );
};

export default MovieCard;
