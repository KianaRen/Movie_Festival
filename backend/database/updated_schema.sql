
-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS movie_genres, list_movies, ratings, personality_rating, tags, movie_tags, movie_stars;
DROP TABLE IF EXISTS movies, users, lists, genres, planner_user, user_personality, directors, stars;

-- Users Table
CREATE TABLE users (
    userId INT PRIMARY KEY AUTO_INCREMENT
);

-- Directors Table
CREATE TABLE directors (
    directorId INT PRIMARY KEY AUTO_INCREMENT,
    directorName VARCHAR(255) UNIQUE NOT NULL
);

-- Movies Table
CREATE TABLE movies (
    movieId INT PRIMARY KEY AUTO_INCREMENT,
    imdbId INT UNIQUE,
    title VARCHAR(255) NOT NULL,
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
    timestamp DATETIME,
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
    timestamp DATETIME,
    FOREIGN KEY (useri) REFERENCES user_personality(useri) ON DELETE CASCADE,
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

-- Planner-user Table (For authentication)
CREATE TABLE planner_user (
    plannerUserId INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) UNIQUE,
    password VARCHAR(255) NOT NULL,
    passwordSalt BINARY(16) NOT NULL
);

-- Lists Table (User-created movie lists)
CREATE TABLE lists (
    listId INT PRIMARY KEY AUTO_INCREMENT,
    listTitle VARCHAR(255),
    listDescription VARCHAR(255),
    plannerUserId INT,
    FOREIGN KEY (plannerUserId) REFERENCES planner_user(plannerUserId) ON DELETE CASCADE
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
    tag VARCHAR(255) UNIQUE NOT NULL
);

-- MovieTags Table
CREATE TABLE movie_tags (
    movieTagId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    movieId INT,
    tagId INT,
    timestamp DATETIME,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(tagId) ON DELETE CASCADE
);

-- Stars Table
CREATE TABLE stars (
    starId INT PRIMARY KEY AUTO_INCREMENT,
    starName VARCHAR(255) UNIQUE NOT NULL
);

-- MovieStars Table
CREATE TABLE movie_stars (
    movieStarId INT PRIMARY KEY AUTO_INCREMENT,
    movieId INT,
    starId INT,
    FOREIGN KEY (movieId) REFERENCES movies(movieId) ON DELETE CASCADE,
    FOREIGN KEY (starId) REFERENCES stars(starId) ON DELETE CASCADE
);
