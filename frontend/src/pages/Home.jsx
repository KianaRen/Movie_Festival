import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalMovies, setTotalMovies] = useState(0);
    const limit = 50;
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("token") ? true : false
    );

    const fetchMovies = () => {
        axios.get(`/api/movies?page=${page}&limit=${limit}&search=${searchQuery}`)
            .then((response) => {
                setMovies(response.data.movies);
                setTotalMovies(response.data.total);
            })
            .catch((error) => console.error("Error fetching movies: ", error));
    };

    useEffect(() => {
        fetchMovies();
    }, [page]);

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <div className="home">

            <div className="movies-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <div key={movie.movieId} className="movie-card">
                            <h3>{movie.title}</h3>
                        </div>
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>
        </div>
    );
}

export default Home;
