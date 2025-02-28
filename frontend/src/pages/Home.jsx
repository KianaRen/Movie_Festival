import MovieCard from "../components/MovieCard"
import { useState , useEffect} from "react";
import axios from "axios";
import '../css/Home.css'

function Home(){
    const [searchQuery, setSearchQuery] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const [minRuntime, setMinRuntime] = useState("");
    const [maxRuntime, setMaxRuntime] = useState("");
    const [allTags, setAllTags] = useState([]); 
    const [selectedTags, setSelectedTags] = useState([]); 
    const [tagLimitWarning, setTagLimitWarning] = useState("");
    const [selectedGenres, setSelectedGenres] = useState([]); 
    const [allGenres, setAllGenres] = useState([]);
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [totalMovies, setTotalMovies] = useState(0);
    const limit = 50;  // 50 movies per page

    // Fetch available genres on mount
    useEffect(() => {
        axios.get("/api/genres")
            .then((response) => setAllGenres(response.data.genres))
            .catch((error) => console.error("Error fetching genres: ", error));
    }, []);

    useEffect(() => {
        axios.get("/api/tags")
            .then(response => setAllTags(response.data))
            .catch(error => console.error("Error fetching tags:", error));
    }, []);
    

    const fetchMovies = () => {
        const queryParams = new URLSearchParams({
            page,
            limit,
            search: searchQuery,
        });

        if (startYear) queryParams.append("startYear", startYear);
        if (endYear) queryParams.append("endYear", endYear);
        if (minRuntime) queryParams.append("minRuntime", minRuntime);
        if (maxRuntime) queryParams.append("maxRuntime", maxRuntime);
        if (selectedGenres.length > 0) queryParams.append("genres", selectedGenres.join(","));
        if (selectedTags.length > 0) {
            queryParams.append("tags", selectedTags.join(","));
        }



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

    const handleClear = () => {
        setSearchQuery("");
        setStartYear("");
        setEndYear("");
        setMinRuntime("");
        setMaxRuntime("");
        setSelectedGenres([]);
        setSelectedTags([]);
        setPage(1);
        fetchMovies(); // Fetch all movies again
    };

    const toggleGenre = (genre) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const toggleTagSelection = (selectedTag) => {
        setTagLimitWarning(""); 

        setSelectedTags((prevSelected) => {
            if (prevSelected.length >= 10) {  
                setTagLimitWarning("Can only pick up to 10 tags"); 
                return prevSelected; // Do not add new tag
            }
            if (!prevSelected.includes(selectedTag)) {
                return [...prevSelected, selectedTag];  // Add if not selected
            }
            return prevSelected; 
        });
    };
    
    const removeTag = (tagToRemove) => {
        setSelectedTags((prevSelected) => prevSelected.filter(tag => tag !== tagToRemove));
        setTagLimitWarning(""); 
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
                    <button type="button" className="clear-button" onClick={handleClear}>Clear</button>

                </div>
                <div className="year-filter">
                    <span>Release Year: </span>
                    <input 
                        type="number" 
                        placeholder="Start Year" 
                        className="year-input"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                    />
                    <span>~</span>
                    <input 
                        type="number" 
                        placeholder="End Year" 
                        className="year-input"
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                    />
                </div>
                <div className="year-filter">
                    <span>Runtime(minutes): </span>
                    <input 
                        type="number" 
                        placeholder="Min " 
                        className="year-input"
                        value={minRuntime}
                        onChange={(e) => setMinRuntime(e.target.value)}
                    />
                    <span>~</span>
                    <input 
                        type="number" 
                        placeholder="Max " 
                        className="year-input"
                        value={maxRuntime}
                        onChange={(e) => setMaxRuntime(e.target.value)}
                    />
                </div>
                <div className="genres-filter">
                    {allGenres.map((genre) => (
                        <span
                            key={genre}
                            className={`genre-item ${selectedGenres.includes(genre) ? "selected" : ""}`}
                            onClick={() => toggleGenre(genre)}
                        >
                            {genre}
                        </span>
                    ))}
                </div>
                <div className="tag-filter">
                    <span>Tags: (pick up to 10)</span>
                    <select 
                        multiple 
                        className="tag-dropdown"
                        size="5"
                        onChange={(e) => toggleTagSelection(e.target.value)}
                    >
                        {allTags.map(tag => (
                            <option key={tag.tagId} value={tag.tag}>{tag.tag}</option>
                        ))}
                    </select>

                    {/* Display Selected Tags with "X" Button */}
                    <div className="selected-tags">
                        {selectedTags.map(tag => (
                            <span key={tag} className="selected-tag">
                                {tag} 
                                <button className="remove-tag" onClick={() => removeTag(tag)}>✖</button>
                            </span>
                        ))}
                    </div>
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