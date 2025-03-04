import { Link } from 'react-router-dom'
import { useState, useEffect } from "react";

import '../css/MovieCard.css'
import axios from "axios";

const MovieCard = ({ movie }) => {
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState("");

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await axios.get("/api/mylist/grouped");
                setLists(Object.keys(response.data)); // Get list IDs
            } catch (error) {
                console.error("Error fetching lists:", error);
            }
        };
        fetchLists();
    }, []);

    const onListBtnClick = async () => {
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
        e.stopPropagation(); 
    };

    return <div className="movie-card">
        <Link to={`/dashboard/${movie.movieId}`} className="movie-link">
        <div className="movie-poster">
            <img src = {movie.posterURL} alt = {movie.title}/>
            <div className="movie-overlay">
            <select
                    className="list-select"
                    onChange={(e) => setSelectedListId(e.target.value)}
                    onClick={handleDropdownClick} // Prevent event propagation
                >
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
        </Link>
    </div>

}

export default MovieCard