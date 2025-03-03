import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieListCard from "../components/MovieListCard"
import '../css/MyList.css'

const MyList = () => {
  const [movieList, setMovieList] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieList();
  }, []);

  const fetchMovieList = async () => {
    try {
      const response = await axios.get("/api/mylist");
      setMovieList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movie list:", error);
      setLoading(false);
    }
  };

  const removeFromList = async (movieId) => {
    try {
      await axios.post("/api/mylist/remove", {
        movie_id: movieId,
      });
      fetchMovieList(); // Refresh list
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>

    <div>
      <h2>My Movie List</h2>
      {Object.keys(movieList).length === 0 ? (
        <p>No movies in your list.</p>
      ) : (
        Object.entries(movieList).map(([genre, movies]) => (
          <div key={genre}>
            <h3>{genre}</h3>
            <div className="movies-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <div key={movie.movieId} className="movie-item">
                            <div className="button-container">
                                <button className="remove-button" onClick={() => removeFromList(movie.movieId)}>✖</button>
                            </div>
                            <MovieListCard movie={movie} />
                        </div>
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>
            
          </div>
        ))
      )}
    </div>
    </div>
  );
};

export default MyList;