import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

db_config = {
    "host": os.getenv("MYSQL_HOST", "mysql_db"),
    "port": 3306,
    "user": os.getenv("MYSQL_USER", "root"),  
    "password": os.getenv("MYSQL_PASSWORD", "password"),
    "database": os.getenv("MYSQL_DATABASE", "movie_festival"),
}

def get_db_connection():
    connection = mysql.connector.connect(**db_config)
    return connection
