from flask import Flask, jsonify, request
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests


PLACEHOLDER_USER_ID = 1 
def get_authenticated_user():
    return PLACEHOLDER_USER_ID  # Replace with actual session or token-based authentication

# create a new list for the user
@app.route('/api/mylist/create', methods=['POST'])
def create_list():
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403  # Forbidden
    
    data = request.json
    list_title = data.get("listTitle")
    list_description = data.get("listDescription")

    if not list_title:
        return jsonify({"error": "List title is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "INSERT INTO lists (listTitle, listDescription, plannerUserId) VALUES (%s, %s, %s);",
            (list_title, list_description, user_id)
        )
        connection.commit()
        return jsonify({"message": "List created successfully"}), 201
    
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# fetch all the lists created by the user
@app.route('/api/mylist', methods=['GET'])
def get_user_lists():
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403  # Forbidden

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch all lists created by the user
        cursor.execute("SELECT * FROM lists WHERE plannerUserId = %s;", (user_id,))
        lists = cursor.fetchall()

        # Fetch movies for each list
        lists_with_movies = {}
        for list_item in lists:
            list_id = list_item["listId"]
            cursor.execute("""
                SELECT 
                    m.movieId, m.title, m.releaseYear, m.runtime, m.posterURL 
                FROM list_movies lm
                JOIN movies m ON lm.movieId = m.movieId
                WHERE lm.listId = %s;
            """, (list_id,))
            
            movies = cursor.fetchall()
            list_item["movies"] = movies
            lists_with_movies[list_id] = list_item

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify(lists_with_movies)

# Edit the title and description of a list
@app.route('/api/mylist/edit/<int:list_id>', methods=['PUT'])
def edit_list(list_id):
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403
    
    data = request.json
    new_title = data.get("listTitle")
    new_description = data.get("listDescription")

    if not new_title or not new_description:
        return jsonify({"error": "Missing title or description"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "UPDATE lists SET listTitle = %s, listDescription = %s WHERE listId = %s AND plannerUserId = %s",
            (new_title, new_description, list_id, user_id)
        )
        connection.commit()
        return jsonify({"message": "List updated successfully"}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Delete a list
@app.route('/api/mylist/delete/<int:list_id>', methods=['DELETE'])
def delete_list(list_id):
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM lists WHERE listId = %s AND plannerUserId = %s", (list_id, user_id))
        connection.commit()
        return jsonify({"message": "List deleted successfully"}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Add a movie to the user's list
@app.route('/api/mylist/add', methods=['POST'])
def add_to_list():
    """Add a movie to the user's list."""
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403

    data = request.json
    movie_id = data.get('movie_id')
    list_id = data.get('list_id')

    if not movie_id or not list_id:
        return jsonify({"error": "Missing movie_id or list_id"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Verify list ownership
        cursor.execute("SELECT * FROM lists WHERE listId = %s AND plannerUserId = %s;", (list_id, user_id))
        if not cursor.fetchone():
            return jsonify({"error": "List not found or does not belong to user"}), 403

        # Add movie to list
        cursor.execute("INSERT INTO list_movies (listId, movieId) VALUES (%s, %s);", (list_id, movie_id))
        connection.commit()
        return jsonify({"message": "Movie added to list"}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Remove Movie from User's List
@app.route('/api/mylist/remove', methods=['POST'])
def remove_movie_from_list():
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403

    data = request.json
    movie_id = data.get("movie_id")
    list_id = data.get("list_id")

    if not movie_id or not list_id:
        return jsonify({"error": "Missing movie_id or list_id"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Verify list ownership
        cursor.execute("SELECT * FROM lists WHERE listId = %s AND plannerUserId = %s;", (list_id, user_id))
        if not cursor.fetchone():
            return jsonify({"error": "List not found or does not belong to user"}), 403

        # Remove the movie from the list
        cursor.execute("DELETE FROM list_movies WHERE listId = %s AND movieId = %s;", (list_id, movie_id))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Movie not found in list"}), 404
        return jsonify({"message": "Movie removed from list"}), 200

    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


#  Fetch movies in the user's list, grouped by genre
@app.route('/api/mylist/grouped', methods=['GET'])
def get_user_list_grouped_by_genre():
    user_id = get_authenticated_user()
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                l.listId,
                l.listTitle,
                l.listDescription,
                g.genre, 
                m.movieId, 
                m.title, 
                m.releaseYear, 
                m.runtime, 
                m.posterURL
            FROM lists l
            LEFT JOIN list_movies lm ON l.listId = lm.listId
            LEFT JOIN movies m ON lm.movieId = m.movieId
            LEFT JOIN movie_genres mg ON m.movieId = mg.movieId
            LEFT JOIN genres g ON mg.genreId = g.genreId
            WHERE l.plannerUserId = %s
            ORDER BY l.listTitle, g.genre, m.title;
        """, (user_id,))

        movies = cursor.fetchall()

        # Group movies by list and genre
        user_lists = {}

        for movie in movies:
            list_id = movie.pop("listId")
            list_title = movie.pop("listTitle")
            list_desc = movie.pop("listDescription")
            genre = movie.pop("genre")

            # Initialize list if not exists
            if list_id not in user_lists:
                user_lists[list_id] = {
                    "listTitle": list_title,
                    "listDescription": list_desc,
                    "moviesByGenre": {}
                }

            # Only add movies if they are not null
            if movie["movieId"]:
                if genre not in user_lists[list_id]["moviesByGenre"]:
                    user_lists[list_id]["moviesByGenre"][genre] = []

                user_lists[list_id]["moviesByGenre"][genre].append(movie)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify(user_lists)



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
        WHERE g.genreId != 20
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
        WHERE g.genreId != 20
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
        WHERE g.genreId != 20
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# For Popularity Report (Plot 4: Minimum of the Two Extreme Percentages)
@app.route('/api/stats/extreme-ratings')
def extreme_ratings():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT 
            g.genre, 
            ROUND(
                LEAST(
                    COUNT(CASE WHEN r.rating <= 1 THEN 1 END) * 100.0 / COUNT(*), 
                    COUNT(CASE WHEN r.rating >= 4.5 THEN 1 END) * 100.0 / COUNT(*)
                ), 
            1) AS polarization_percentage
        FROM genres g
        JOIN movie_genres mg ON g.genreId = mg.genreId
        JOIN movies m ON mg.movieId = m.movieId
        JOIN ratings r ON r.movieId = m.movieId
        WHERE g.genreId != 20
        GROUP BY g.genre;
    """)
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(data)

# Fetch rating distribution for a genre
@app.route('/api/genre-ratings')
def get_genre_ratings():
    """ Get rating distribution for a specific genre """
    genre = request.args.get('genre')
    
    if not genre:
        return jsonify({"error": "Genre parameter is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                r.rating, 
                COUNT(*) AS frequency
            FROM genres g
            JOIN movie_genres mg ON g.genreId = mg.genreId
            JOIN movies m ON mg.movieId = m.movieId
            JOIN ratings r ON r.movieId = m.movieId
            WHERE g.genre = %s
            GROUP BY r.rating
            ORDER BY r.rating ASC;
        """, (genre,))
        
        data = cursor.fetchall()
        return jsonify(data)
        
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
        
    finally:
        cursor.close()
        connection.close()

# Fetch Viewer Personality
@app.route('/api/viewer-personality')
def viewer_personality():
    genre = request.args.get('genre')
    
    if not genre:
        return jsonify({"error": "Genre parameter is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                g.genre,
                ROUND(AVG(up.openness), 3) AS avg_openness,
                ROUND(AVG(up.agreeableness), 3) AS avg_agreeableness,
                ROUND(AVG(up.emotional_stability), 3) AS avg_emotional_stability,
                ROUND(AVG(up.conscientiousness), 3) AS avg_conscientiousness,
                ROUND(AVG(up.extraversion), 3) AS avg_extraversion
            FROM genres g
            JOIN movie_genres mg ON g.genreId = mg.genreId
            JOIN movies m ON mg.movieId = m.movieId
            JOIN personality_rating pr ON pr.movieId = m.movieId
            JOIN user_personality up ON up.useri = pr.useri
            WHERE g.genre = %s
            GROUP BY g.genre;
        """, (genre,))
        
        data = cursor.fetchall()
        return jsonify(data[0] if data else {})
        
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
        
    finally:
        cursor.close()
        connection.close()

@app.route('/api/rating-correlation')
def rating_correlation():
    genreA = request.args.get('genreA')
    genreB = request.args.get('genreB')
    
    if not genreA or not genreB:
        return jsonify({"error": "Both genres required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            WITH genre_ratings AS (
                SELECT 
                    r.userId,
                    AVG(CASE WHEN g.genre = %s THEN r.rating END) AS ga,
                    AVG(CASE WHEN g.genre = %s THEN r.rating END) AS gb
                FROM ratings r
                JOIN movies m ON r.movieId = m.movieId
                JOIN movie_genres mg ON m.movieId = mg.movieId
                JOIN genres g ON mg.genreId = g.genreId
                WHERE g.genre IN (%s, %s)
                GROUP BY r.userId
                HAVING COUNT(DISTINCT g.genre) = 2
            )
            SELECT 
                SUM(CASE WHEN ga < 4 AND gb < 4 THEN 1 ELSE 0 END),
                SUM(CASE WHEN ga < 4 AND gb >= 4 THEN 1 ELSE 0 END),
                SUM(CASE WHEN ga >= 4 AND gb < 4 THEN 1 ELSE 0 END),
                SUM(CASE WHEN ga >= 4 AND gb >= 4 THEN 1 ELSE 0 END),
                COUNT(*)
            FROM genre_ratings;
        """, (genreA, genreB, genreA, genreB))
        
        result = cursor.fetchone()
        
        return jsonify({
            "lowBoth": result[0],
            "lowAHighB": result[1],
            "highALowB": result[2],
            "highBoth": result[3],
            "totalUsers": result[4]
        })
        
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

