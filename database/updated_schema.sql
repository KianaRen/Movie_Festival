
-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS movie_genres, list_movies, ratings, personality_rating, tags;
DROP TABLE IF EXISTS movies, users, lists, genres, planner_user, user_personality, directors;

-- Users Table
CREATE TABLE users (
    userId INT PRIMARY KEY AUTO_INCREMENT
);

-- Movies Table
CREATE TABLE movies (
    movieId INT PRIMARY KEY AUTO_INCREMENT,
    imdbId INT UNIQUE,
    title VARCHAR(255) NOT NULL,
    seriesTitle VARCHAR(255),
    releaseYear YEAR NOT NULL,
    directorId INT,
    runtime INT,
    overview VARCHAR(255),
    boxOffice DECIMAL(15,2),
    criticScore DOUBLE,
    posterURL VARCHAR(255),
    FOREIGN KEY (directorId) REFERENCES directors(directorId) ON DELETE CASCADE
);

-- Ratings Table
CREATE TABLE ratings (
    ratingId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    movieId INT,
    rating DOUBLE,
    timestamp INT(20),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE
);

-- Personality Table
CREATE TABLE user_personality (
    useri VARCHAR(255) PRIMARY KEY,
    openness DOUBLE,
    agreeableness DOUBLE,
    emotional_stability DOUBLE,
    conscientiousness DOUBLE,
    extraversion DOUBLE
);

-- Personality Ratings Table
CREATE TABLE personality_rating (
    ratingId INT PRIMARY KEY AUTO_INCREMENT,
    useri VARCHAR(255),
    movieId INT,
    rating DOUBLE,
    tstamp DATETIME,
    FOREIGN KEY (useri) REFERENCES useri(user_personality) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE
);

-- Genres Table
CREATE TABLE genres (
    genreId INT PRIMARY KEY AUTO_INCREMENT,
    genre VARCHAR(50) UNIQUE NOT NULL
);

-- Movie-Genres Relationship Table (Many-to-Many)
CREATE TABLE movie_genres (
    movieGenreId INT PRIMARY KEY AUTO_INCREMENT,
    movieId INT,
    genreId INT,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE,
    FOREIGN KEY (genreId) REFERENCES genres(genreId) ON DELETE CASCADE
);

-- Directors Table
CREATE TABLE directors (
    directorId INT PRIMARY KEY AUTO_INCREMENT,
    directorName VARCHAR(255) UNIQUE NOT NULL
);

-- Lists Table (User-created movie lists)
CREATE TABLE lists (
    listId INT PRIMARY KEY AUTO_INCREMENT,
    listTitle VARCHAR(255),
    username VARCHAR(30),
    FOREIGN KEY (username) REFERENCES planner_user(username) ON DELETE CASCADE
);

-- Movie-Lists Relationship Table (Many-to-Many)
CREATE TABLE list_movies (
    listMovieId INT PRIMARY KEY AUTO_INCREMENT,
    listId INT,
    movieId INT,
    FOREIGN KEY (listId) REFERENCES lists(listId) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE
);

-- Tags Table
CREATE TABLE tags (
    tagId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    movieId INT,
    timestamp INT(20),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE
);

-- Planner-user Table (For authentication)
CREATE TABLE planner_user (
    username VARCHAR(30) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);
