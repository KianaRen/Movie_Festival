from flask import Flask, jsonify, request
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

@app.route('/api/movies', methods=['GET'])
def get_movies():
    # Get pagination parameters from query string
    search_query = request.args.get('search', '').strip()
    start_year = request.args.get("startYear", type=int)
    end_year = request.args.get("endYear", type=int)
    min_runtime = request.args.get("minRuntime", type=int)
    max_runtime = request.args.get("maxRuntime", type=int)
    page = request.args.get("page", default=1, type=int)
    genres = request.args.get("genres", "").split(",") if request.args.get("genres") else []
    tags = request.args.get("tags", "").split(",") if request.args.get("tags") else []
    limit = request.args.get("limit", default=50, type=int)
    offset = (page - 1) * limit

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    conditions = []
    params = []

    if search_query:
        search_pattern = f"%{search_query}%"
        conditions.append("(movies.title LIKE %s OR directors.directorName LIKE %s OR stars.starName LIKE %s)")
        params.extend([search_pattern, search_pattern, search_pattern])

    # Release year filtering
    if start_year and end_year:
        conditions.append("movies.releaseYear BETWEEN %s AND %s")
        params.extend([start_year, end_year])
    elif start_year:
        conditions.append("movies.releaseYear >= %s")
        params.append(start_year)
    elif end_year:
        conditions.append("movies.releaseYear <= %s")
        params.append(end_year)

    # Runtime filtering
    if min_runtime and max_runtime:
        conditions.append("movies.runtime BETWEEN %s AND %s")
        params.extend([min_runtime, max_runtime])
    elif min_runtime:
        conditions.append("movies.runtime >= %s")
        params.append(min_runtime)
    elif max_runtime:
        conditions.append("movies.runtime <= %s")
        params.append(max_runtime)
    
    # Genre filtering
    if genres:
        genre_placeholders = ', '.join(['%s'] * len(genres))
        genre_subquery = f"""
            movies.movieId IN (
                SELECT movie_genres.movieId FROM movie_genres 
                JOIN genres ON movie_genres.genreId = genres.genreId 
                WHERE genres.genre IN ({genre_placeholders})
            )
        """
        conditions.append(genre_subquery)
        params.extend(genres)
    
    if tags:
        tag_placeholders = ', '.join(['%s'] * len(tags))  # Correct placeholders
        conditions.append(f"""
            movies.movieId IN (
                SELECT movie_tags.movieId
                FROM movie_tags
                JOIN tags ON movie_tags.tagId = tags.tagId
                WHERE tags.tag IN ({tag_placeholders})
            )
        """)
        params.extend(tags)  # Add each tag to parameters


    where_clause = " AND ".join(conditions) if conditions else "1=1"  

    # Count total matching movies
    count_query = f"""
        SELECT COUNT(DISTINCT movies.movieId) AS total
        FROM movies
        LEFT JOIN directors ON movies.directorId = directors.directorId
        LEFT JOIN movie_stars ON movies.movieId = movie_stars.movieId
        LEFT JOIN stars ON movie_stars.starId = stars.starId
        LEFT JOIN movie_genres ON movies.movieId = movie_genres.movieId
        LEFT JOIN genres ON movie_genres.genreId = genres.genreId
        WHERE {where_clause};
    """
    cursor.execute(count_query, tuple(params))
    total_movies = cursor.fetchone()["total"]

    # Get movie details
    fetch_query = f"""
        SELECT DISTINCT movies.* 
        FROM movies
        LEFT JOIN directors ON movies.directorId = directors.directorId
        LEFT JOIN movie_stars ON movies.movieId = movie_stars.movieId
        LEFT JOIN stars ON movie_stars.starId = stars.starId
        LEFT JOIN movie_genres ON movies.movieId = movie_genres.movieId
        LEFT JOIN genres ON movie_genres.genreId = genres.genreId
        WHERE {where_clause}
        LIMIT %s OFFSET %s;
    """
    cursor.execute(fetch_query, tuple(params + [limit, offset]))
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


@app.route('/api/genres', methods=['GET'])
def get_genres():
    """ Fetch all available genres for filtering """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT DISTINCT genre FROM genres WHERE genreId != 20;")
    genres = [row["genre"] for row in cursor.fetchall()]

    cursor.close()
    connection.close()

    return jsonify({"genres": genres})

@app.route('/api/tags', methods=['GET'])
def get_tags():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT DISTINCT tagId, tag FROM tags;")
    tags = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(tags)

# For Popularity Report (Plot 1: Number of movies per genre)
@app.route('/api/stats/movies-per-genre')
def movies_per_genre():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT COUNT(*) AS count, g.genre
        FROM genres g
        JOIN movie_genres mg ON mg.genreId = g.genreId
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# For Popularity Report (Plot 2: Average box office per genre)
@app.route('/api/stats/avg-boxoffice')
def avg_boxoffice():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT ROUND(AVG(m.boxOffice), -2) AS average, g.genre
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN movies m ON mg.movieId = m.movieId
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# For Popularity Report (Plot 3: Average rating per genre)
@app.route('/api/stats/avg-rating')
def avg_rating():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT ROUND(AVG(r.rating), 2) AS average, g.genre
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN movies m ON mg.movieId = m.movieId
        JOIN ratings r ON r.movieId = m.movieId
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# For Popularity Report (Plot 4: Extreme rating %)
@app.route('/api/stats/extreme-ratings')
def extreme_ratings():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT 
            g.genre, 
            ROUND(COUNT(CASE WHEN r.rating = 1 OR r.rating = 5 THEN 1 END) * 100.0 / COUNT(*), 1) AS percentage
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN movies m ON mg.movieId = m.movieId
        JOIN ratings r ON r.movieId = m.movieId
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

