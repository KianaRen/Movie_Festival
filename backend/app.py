from flask import Flask, jsonify
from flask_cors import CORS
from database.db import get_db_connection  # Import database connection

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

@app.route('/api/movies', methods=['GET'])
def get_movies():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM movies LIMIT 10;")  # Example query
    movies = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(movies)  # Return JSON response

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)

