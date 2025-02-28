import MovieCard from "../components/MovieCard"
import { useState , useEffect} from "react";
import axios from "axios";
import '../css/Home.css'

function Home(){
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalMovies, setTotalMovies] = useState(0);
    const limit = 50;  // 50 movies per page

    useEffect(() => {
        axios.get(`/api/movies?page=${page}&limit=${limit}`)
        .then((response) => {
            setMovies(response.data.movies);
            setTotalMovies(response.data.total);  // Store total movies count
        })
        .catch((error) => console.error("Error fetching movies: ", error));
    }, [page]); 

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
            <div className="pagination">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                >
                    Previous
                </button>

                <span> Page {page} of {Math.ceil(totalMovies / limit)} </span>

                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= Math.ceil(totalMovies / limit)}
                >
                    Next
                </button>
            </div>


        </div>
    );
}

export default Home