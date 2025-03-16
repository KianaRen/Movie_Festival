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

  const scrollToList = (listId) => {
    const element = document.getElementById(`list-${listId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Function to create a new list
  const createNewList = async () => {
    const title = prompt("Enter list title:");
    if (!title) return;

    const description = prompt("Enter list description:");
    if (!description) return;

    try {
      const response = await axios.post("/api/mylist/create", {
        listTitle: title,
        listDescription: description,
      });

      if (response.status === 201) {
        fetchMovieLists(); // Refresh lists
      }
    } catch (error) {
      console.error("Error creating movie list:", error);
      alert("Failed to create list.");
    }
  };

  // Function to edit a list
  const editList = async (listId, currentTitle, currentDescription) => {
    const newTitle = prompt("Edit list title:", currentTitle);
    if (!newTitle) return;

    const newDescription = prompt("Edit list description:", currentDescription);
    if (!newDescription) return;

    try {
      const response = await axios.put(`/api/mylist/edit/${listId}`, {
        listTitle: newTitle,
        listDescription: newDescription,
      });

      if (response.status === 200) {
        fetchMovieLists(); // Refresh lists
      }
    } catch (error) {
      console.error("Error editing movie list:", error);
      alert("Failed to edit list.");
    }
  };

  // Function to delete a list
  const deleteList = async (listId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this list?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`/api/mylist/delete/${listId}`);
      if (response.status === 200) {
        fetchMovieLists(); // Refresh lists
      }
    } catch (error) {
      console.error("Error deleting movie list:", error);
      alert("Failed to delete list.");
    }
  };

// Function to remove a movie from a list
const handleRemoveMovie = async (listId, movieId) => {
    try {
        await axios.post("/api/mylist/remove", {
        list_id: listId,
        movie_id: movieId
        });
    
        setMovieLists((prevLists) => {
        const updatedLists = { ...prevLists };
    
        if (updatedLists[listId]?.moviesByGenre) {
            for (const genre in updatedLists[listId].moviesByGenre) {
            updatedLists[listId].moviesByGenre[genre] =
                updatedLists[listId].moviesByGenre[genre].filter(
                (movie) => movie.movieId !== movieId
                );
    
            // If genre is now empty, remove it
            if (updatedLists[listId].moviesByGenre[genre].length === 0) {
                delete updatedLists[listId].moviesByGenre[genre];
            }
            }
    
            // ✅ Instead of deleting the list, keep it and ensure `moviesByGenre` is an empty object
            if (Object.keys(updatedLists[listId].moviesByGenre).length === 0) {
            updatedLists[listId].moviesByGenre = {}; // Keep the list with an empty movies object
            }
        }
    
        return { ...updatedLists };
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

      {Object.keys(movieLists).length > 0 && (
        <div className="list-navigation">
          <ul>
            {Object.entries(movieLists).map(([listId, list]) => (
              <li key={listId} onClick={() => scrollToList(listId)} className="list-nav-item">
                {list.listTitle}
              </li>
            ))}
            <button onClick={createNewList} className="create-list-button">+</button>
          </ul>
        </div>
      )}

    {Object.keys(movieLists).length === 0 ? (
        <p>No movie lists found. Click the button above to create one!</p>
      ) : (
        <div className="my-list-container">
          {Object.entries(movieLists).map(([listId, list]) => (
            <div key={listId} id={`list-${listId}`} className="movie-list-section">
              <div className="list-header">
                <h3>{list.listTitle}</h3>
                <div className="list-actions">
                    <button onClick={() => editList(listId, list.listTitle, list.listDescription)} className="edit-button">Edit</button>
                    <button onClick={() => deleteList(listId)} className="delete-button">Delete</button>
                </div>
              </div>
              <p className="list-description">{list.listDescription}</p>
              {Object.keys(list.moviesByGenre).length > 0 ? (
                Object.entries(list.moviesByGenre).map(([genre, movies]) => (
                  <div key={genre} className="genre-section">
                    <h4>{genre}</h4>
                    <div className="movie-list">
                      {movies.map((movie) => (
                        <MovieListCard key={movie.movieId} 
                        movie={movie} 
                        onRemove={() => handleRemoveMovie(listId, movie.movieId)}/>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                <p className="empty-list-message">No movies in this list yet. Add some!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
