import MovieCard from "../components/MovieCard"
import { useState , useEffect} from "react";
import axios from "axios";
import '../css/Home.css'

function Home(){
    const [searchQuery, setSearchQuery] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const [selectedGenres, setSelectedGenres] = useState([]); 
    const [allGenres, setAllGenres] = useState([]);
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalMovies, setTotalMovies] = useState(0);
    const limit = 50;  // 50 movies per page

    const fetchMovies = () => {
        const queryParams = new URLSearchParams({
            page,
            limit,
            search: searchQuery,
        });

        if (startYear) queryParams.append("startYear", startYear);
        if (endYear) queryParams.append("endYear", endYear);

        axios.get(`/api/movies?${queryParams.toString()}`)
            .then((response) => {
                setMovies(response.data.movies);
                setTotalMovies(response.data.total);
            })
            .catch((error) => console.error("Error fetching movies: ", error));
    };

    useEffect(() => {
        fetchMovies();
    }, [page]); 

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);  // Reset to first page on search
        fetchMovies();
    };

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search for movies..." 
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button">Search</button>
                </div>
                <div className="year-filter">
                    <span>From</span>
                    <input 
                        type="number" 
                        placeholder="Start Year" 
                        className="year-input"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                    />
                    <span>to</span>
                    <input 
                        type="number" 
                        placeholder="End Year" 
                        className="year-input"
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                    />
                </div>

                
            </form>

            <div className="movies-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <MovieCard movie={movie} key={movie.movieId}/>
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>
            <div className="pagination">
                <button className="page-button"
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                >
                    Prev
                </button>

                <span> Page {page} of {Math.ceil(totalMovies / limit)} </span>

                <button className="page-button"
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= Math.ceil(totalMovies / limit)}
                >
                    Nexttt
                </button>
            </div>


        </div>
    );
}

export default Home