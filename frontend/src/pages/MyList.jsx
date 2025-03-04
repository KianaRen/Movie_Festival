import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieListCard from "../components/MovieListCard";
import "../css/MyList.css";

const MyList = () => {
  const [movieLists, setMovieLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMovieLists();
  }, []);

  const fetchMovieLists = async () => {
    try {
      const response = await axios.get("/api/mylist/grouped");
      setMovieLists(response.data);
    } catch (err) {
      console.error("Error fetching movie lists:", err);
      setError("Failed to fetch movie lists.");
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new list
  const createNewList = async () => {
    const title = prompt("Enter list title:");
    if (!title) return; // Exit if no title

    const description = prompt("Enter list description:");
    if (!description) return; // Exit if no description

    try {
      const response = await axios.post("/api/mylist/create", {
        listTitle: title,
        listDescription: description,
        plannerUserId: 1, // Temporary user ID (replace this when auth is implemented)
      });

      if (response.status === 201) {
        alert("List created successfully!");
        await fetchMovieLists(); // Refresh lists
      }
    } catch (error) {
      console.error("Error creating movie list:", error);
      alert("Failed to create list.");
    }
  };

  const handleRemoveMovie = async (listId, movieId) => {
    try {
      await axios.post("/api/mylist/remove", {
        list_id: listId,
        movie_id: movieId
      });

      // Update state to remove the movie
      setMovieLists((prevLists) => {
        const updatedLists = { ...prevLists };
        for (const genre in updatedLists[listId].moviesByGenre) {
          updatedLists[listId].moviesByGenre[genre] = updatedLists[listId].moviesByGenre[genre].filter(
            (movie) => movie.movieId !== movieId
          );
          // Remove empty genre sections
          if (updatedLists[listId].moviesByGenre[genre].length === 0) {
            delete updatedLists[listId].moviesByGenre[genre];
          }
        }
        // Remove empty lists
        if (Object.keys(updatedLists[listId].moviesByGenre).length === 0) {
          delete updatedLists[listId];
        }
        return updatedLists;
      });
    } catch (err) {
      console.error("Error removing movie:", err);
      alert("Failed to remove movie.");
    }
  };

  if (loading) return <p>Loading your movie lists...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>My Movie Lists</h2>
      <button onClick={createNewList} className="create-list-button">Create New List</button>

      {Object.keys(movieLists).length === 0 ? (
        <p>No movie lists found. Click the button above to create one!</p>
      ) : (
        <div className="my-list-container">
          {Object.entries(movieLists).map(([listId, list]) => (
            <div key={listId} className="movie-list-section">
              <h3>{list.listTitle}</h3>
              <p className="list-description">{list.listDescription}</p>

              {Object.entries(list.moviesByGenre).map(([genre, movies]) => (
                <div key={genre} className="genre-section">
                  <h4>{genre}</h4>
                  <div className="movie-list">
                    {movies.map((movie) => (
                      <MovieListCard
                        key={movie.movieId}
                        movie={movie}
                        onRemove={() => handleRemoveMovie(listId, movie.movieId)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
