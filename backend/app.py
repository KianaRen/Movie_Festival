from flask import Flask, jsonify, request
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

@app.route('/api/movies', methods=['GET'])
def get_movies():
    # Get pagination parameters from query string
    search_query = request.args.get('search', '').strip()
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=50, type=int)
    offset = (page - 1) * limit

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    if search_query:
        search_pattern = f"%{search_query}%"

        # Count total matching movies
        cursor.execute("""
            SELECT COUNT(DISTINCT movies.movieId) AS total
            FROM movies
            LEFT JOIN directors ON movies.directorId = directors.directorId
            LEFT JOIN movie_stars ON movies.movieId = movie_stars.movieId
            LEFT JOIN stars ON movie_stars.starId = stars.starId
            WHERE movies.title LIKE %s 
               OR directors.directorName LIKE %s 
               OR stars.starName LIKE %s;
        """, (search_pattern, search_pattern, search_pattern))
        total_movies = cursor.fetchone()["total"]

        # Get movie details
        cursor.execute("""
            SELECT DISTINCT movies.* 
            FROM movies
            LEFT JOIN directors ON movies.directorId = directors.directorId
            LEFT JOIN movie_stars ON movies.movieId = movie_stars.movieId
            LEFT JOIN stars ON movie_stars.starId = stars.starId
            WHERE movies.title LIKE %s 
               OR directors.directorName LIKE %s 
               OR stars.starName LIKE %s
            LIMIT %s OFFSET %s;
        """, (search_pattern, search_pattern, search_pattern, limit, offset))
    else:
        cursor.execute("SELECT COUNT(*) AS total FROM movies;")
        total_movies = cursor.fetchone()["total"]
        cursor.execute("SELECT * FROM movies LIMIT %s OFFSET %s;", (limit, offset))
    
    movies = cursor.fetchall()
    
    cursor.close()
    connection.close()

    return jsonify({
        "movies": movies,
        "total": total_movies,
        "page": page,
        "limit": limit
    })

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT m.movieId, m.title, m.releaseYear, m.runtime, m.overview, m.posterURL, d.directorName 
        FROM movies m
        LEFT JOIN directors d ON m.directorId = d.directorId
        WHERE m.movieId = %s;
    """, (movie_id,))
    movie = cursor.fetchone()

    if not movie:
        cursor.close()
        connection.close()
        return jsonify({"error": "Movie not found"}), 404
    

    # Fetch stars associated with the movie
    cursor.execute("""
        SELECT s.starName 
        FROM stars s
        JOIN movie_stars ms ON s.starId = ms.starId
        WHERE ms.movieId = %s;
    """, (movie_id,))
    
    stars = cursor.fetchall()

    # Fetch genres
    cursor.execute("""
        SELECT g.genre 
        FROM genres g 
        JOIN movie_genres mg ON g.genreId = mg.genreId 
        WHERE mg.movieId = %s;
    """, (movie_id,))
    genres = [row["genre"] for row in cursor.fetchall()]

    # Fetch tags
    cursor.execute("""
        SELECT t.tag 
        FROM tags t 
        JOIN movie_tags mt ON t.tagId = mt.tagId 
        WHERE mt.movieId = %s;
    """, (movie_id,))
    tags = [row["tag"] for row in cursor.fetchall()]
    
    cursor.close()
    connection.close()

    # save the fetched data in the movie dictionary
    movie["stars"] = [star["starName"] for star in stars]
    movie["genres"] = genres
    movie["tags"] = tags

    return jsonify(movie)


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

