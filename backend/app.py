from flask import Flask, jsonify, request
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

@app.route('/api/movies', methods=['GET'])
def get_movies():
    # Get pagination parameters from query string
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=50, type=int)
    offset = (page - 1) * limit

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Query to get total movie count
    cursor.execute("SELECT COUNT(*) AS total FROM movies;")
    total_movies = cursor.fetchone()["total"]

    # Query to get paginated movies
    cursor.execute("SELECT * FROM movies LIMIT %s OFFSET %s;", (limit, offset))
    movies = cursor.fetchall()

    # Close connection
    cursor.close()
    connection.close()

    # Return paginated results with metadata
    return jsonify({
        "movies": movies,
        "total": total_movies,
        "page": page,
        "limit": limit
    })


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

