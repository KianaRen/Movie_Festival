from flask import Flask, jsonify, request
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
import statsmodels.api as sm

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

@app.route('/api/genres-withId', methods=['GET'])
def get_genres_withId():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT genreId, genre FROM genres WHERE genreId != 20;")
    genres = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(genres)

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
    genreId = request.args.get('genreId')
    
    if not genreId or not genreId.isdigit():
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
            WHERE g.genreId = %s
            GROUP BY r.rating
            ORDER BY r.rating ASC;
        """, (int(genreId),))
        
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

# Categorise users with their average ratings in two genres
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

# Get distinct user IDs from ratings table
@app.route('/api/users-with-ratings', methods=['GET'])
def get_users_with_ratings():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT DISTINCT userId 
            FROM ratings 
            ORDER BY userId
        """)
        
        users = cursor.fetchall()
        return jsonify(users), 200
        
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
        
    finally:
        cursor.close()
        connection.close()

@app.route('/api/user-genre-ratings')
def get_user_genre_ratings():
    """ Fetch rating history of a user """
    userId = request.args.get('userId')
    
    if not userId or not userId.isdigit():
        return jsonify({"error": "Valid userId parameter required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                g.genre,
                r.rating
            FROM ratings r
            JOIN movie_genres mg ON r.movieId = mg.movieId
            JOIN genres g ON mg.genreId = g.genreId
            WHERE r.userId = %s
            ORDER BY g.genre ASC, r.rating DESC;
        """, (int(userId),))
        
        data = cursor.fetchall()
        return jsonify({
            "userId": userId,
            "ratings": data
        })
        
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
        
    finally:
        cursor.close()
        connection.close()

# Fetch popular tags (used ≥20 times, not genre names, not used in conjunction with a non-popular tag) 
@app.route('/api/popular-tags', methods=['GET'])
def get_popular_tags():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    min_count = 20

    try:
        cursor.execute("""
            WITH PopularTags AS (
                SELECT mt.tagId, t.tag
                FROM movie_tags mt
                JOIN tags t ON mt.tagId = t.tagId
                GROUP BY mt.tagId
                HAVING COUNT(*) >= %s
            ),
            ValidMovies AS (
                SELECT DISTINCT mt.movieId
                FROM movie_tags mt
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM movie_tags mt2
                    WHERE mt2.movieId = mt.movieId
                    AND mt2.tagId NOT IN (SELECT tagId FROM PopularTags)
                )
            )
            SELECT pt.tagId, pt.tag
            FROM PopularTags pt
            WHERE NOT EXISTS (
                SELECT 1
                FROM genres g
                WHERE LOWER(pt.tag) = LOWER(g.genre)
            )
            AND pt.tagId IN (
                SELECT DISTINCT mt.tagId
                FROM movie_tags mt
                JOIN ValidMovies vm ON mt.movieId = vm.movieId
            )
            ORDER BY pt.tag;
        """, (min_count,))
        tags = cursor.fetchall()
        return jsonify(tags), 200
    except Exception as e:
        print("Database error:", str(e))
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

# Fetch training data for the model
@app.route('/api/training-data', methods=['GET'])
def get_training_data():
    """Endpoint to fetch training data"""
    connection = None
    cursor = None
    
    try:
        # Get valid IDs from other endpoints
        genres_response = get_genres_withId()
        valid_genre_ids = [g['genreId'] for g in genres_response.get_json()]
        
        tags_response, _ = get_popular_tags()
        popular_tag_ids = [t['tagId'] for t in tags_response.get_json()]

        # Generate SQL components
        valid_genres_cte = generate_ids_cte(valid_genre_ids, "valid_genres")
        popular_tags_cte = generate_ids_cte(popular_tag_ids, "popular_tags")

        # Build full SQL query
        query = f"""
        WITH
            {valid_genres_cte},
            {popular_tags_cte},
            movie_valid_genres AS (
                SELECT mg.movieId, JSON_ARRAYAGG(mg.genreId) AS genres
                FROM (
                    SELECT DISTINCT movieId, genreId 
                    FROM movie_genres 
                    WHERE genreId IN (SELECT * FROM valid_genres)
                ) mg
                GROUP BY mg.movieId
            ),
            movie_clean_tags AS (
                SELECT mt.movieId, 
                       JSON_ARRAYAGG(mt.tagId) AS tags
                FROM movie_tags mt
                WHERE mt.tagId IN (SELECT * FROM popular_tags)
                GROUP BY mt.movieId
            ),
            movie_ratings AS (
                SELECT r.movieId, 
                       ROUND(AVG(r.rating), 4) AS avg_rating,
                       COUNT(r.rating) AS rating_count
                FROM ratings r
                GROUP BY r.movieId
            )
        SELECT
            m.movieId, mr.avg_rating, mr.rating_count,
            COALESCE(g.genres, JSON_ARRAY()) AS genres,
            COALESCE(t.tags, JSON_ARRAY()) AS tags
        FROM movies m
        JOIN movie_ratings mr ON m.movieId = mr.movieId
        LEFT JOIN movie_valid_genres g ON m.movieId = g.movieId
        LEFT JOIN movie_clean_tags t ON m.movieId = t.movieId
        WHERE
            NOT EXISTS (
                SELECT 1 FROM movie_genres mg
                WHERE mg.movieId = m.movieId
                AND mg.genreId NOT IN (SELECT * FROM valid_genres)
            )
            AND (
            JSON_LENGTH(g.genres) > 0 OR JSON_LENGTH(t.tags) > 0
            )
        ORDER BY mr.avg_rating DESC;"""

        # Execute query
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()

        # Convert JSON strings to Python objects
        for row in results:
            row['genres'] = json.loads(row['genres'])
            row['tags'] = json.loads(row['tags'])

        return jsonify({
            'success': True,
            'count': len(results),
            'data': results
        }), 200

    except Exception as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch training data',
            'message': str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def generate_ids_cte(id_list, cte_name):
    """Helper to generate CTE for ID lists"""
    if id_list:
        selects = " UNION ALL ".join([f"SELECT {id}" for id in id_list])
        return f"{cte_name} AS ({selects})"
    return f"{cte_name} AS (SELECT NULL LIMIT 0)"

# Train a linear regression
@app.route('/api/trainLM', methods=['GET'])
def trainLM():
    """Endpoint for the linear regression summary"""
    response, status_code = get_training_data()  # Unpack the tuple

    # Check for errors
    if status_code != 200:
        return response  # Return the original error response

    # Extract JSON data from the Response object
    training_data = response.get_json()

    # Access the "data" list from the JSON
    data_list = training_data["data"]

    # Populate lists
    movie_ids = [movie["movieId"] for movie in data_list]
    average_ratings = [movie["avg_rating"] for movie in data_list]
    genre_ids = [movie["genres"] for movie in data_list]
    tag_ids = [movie["tags"] for movie in data_list]

    df = pd.DataFrame({"movieId": movie_ids,
        "average_rating": average_ratings,
        "genreId": genre_ids,
        "tagId": tag_ids})

    # Initialize Binarizers
    mlb_genre = MultiLabelBinarizer()
    mlb_tag = MultiLabelBinarizer()

    # One-hot encode genres and tags
    genre_features = mlb_genre.fit_transform(df['genreId'])
    tag_features = mlb_tag.fit_transform(df['tagId'])
    
    # Get feature names for genres and tags
    genre_names = mlb_genre.classes_.tolist()
    tag_names = mlb_tag.classes_.tolist()
    all_feature_names = genre_names + tag_names

    # Combine features into a named DataFrame
    X = np.hstack([genre_features, tag_features])
    X_df = pd.DataFrame(X, columns=all_feature_names)
    X_sm = sm.add_constant(X_df, prepend=True, has_constant="add")  # Add "const"

    y = df['average_rating'].values

    # Fit OLS model
    model = sm.OLS(y, X_sm)
    results = model.fit()
    
    # Extract key statistics about the model
    response_data = {
        "success": True,
        "rsquared": results.rsquared,
        "rsquared_adj": results.rsquared_adj,
        "coefficients": {
            "names": results.params.index.tolist(),
            "values": results.params.values.tolist(),
            "pvalues": results.pvalues.tolist()
        },
        "f_statistic": {
            "fvalue": results.fvalue,
            "f_pvalue": results.f_pvalue
        }
    }

    return jsonify(response_data), 200


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

