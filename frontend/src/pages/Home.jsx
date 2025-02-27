import MovieCard from "../components/MovieCard"
import { useState , useEffect} from "react";
import axios from "axios";
import '../css/Home.css'

function Home(){
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        axios.get("/api/movies")
        .then((response) => setMovies(response.data))  // Store movies in state
        .catch((error) => console.error("Error fetching movies: ", error));
    }, []);

    const handleSearch = (e) => {
        alert(searchQuery)
        e.preventDefault()

    };

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    placeholder="Search for movies..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard movie={movie} key={movie.id}/>
                ))}
            </div>
        </div>
    );
}

export default Home