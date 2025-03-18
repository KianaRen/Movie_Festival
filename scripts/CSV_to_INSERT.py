import csv

# Generate INSERT files from CSV
def csv_to_sql(csv_path, table_name, id_col, pk_not_included):
    with open(csv_path, 'r') as csv_file, open(f"scripts/insert/insert_{table_name}.sql", 'w') as sql_file:
        
        reader = csv.DictReader(csv_file)
        rows = list(reader)

        # Find max ID for AUTO_INCREMENT. Only for numeric PKs
        max_id = 0
        if not pk_not_included:
            max_id = max(int(row[id_col]) for row in rows) if rows else 0

        sql_file.write(f"""SET @@SESSION.sql_mode = 'NO_AUTO_VALUE_ON_ZERO';\n\n""")
        
        for row in rows:
            columns = []
            values = []
            for col, val in row.items():
                columns.append(col)
                values.append(
                    val if col == id_col 
                    else f"'{val.replace("'", "''")}'"  # Escape single quotes
                )
            
            sql_file.write(
                f"INSERT INTO {table_name} ({', '.join(columns)}) "
                f"VALUES ({', '.join(values)});\n"
            )

        # Only reset AUTO_INCREMENT for numeric PKs
        if not pk_not_included and rows:
            sql_file.write(f"\nALTER TABLE {table_name} AUTO_INCREMENT = {max_id + 1};\n\n\n")


# Generate INSERT statements for entities in their dependency order
csv_to_sql(csv_path='backend/database/cleaned/genres.csv', table_name='genres', id_col='genreId', pk_not_included=False)
csv_to_sql('backend/database/cleaned/directors.csv', 'directors', 'directorId', False)
csv_to_sql('backend/database/cleaned/tags.csv', 'tags', 'tagId', False)
csv_to_sql('backend/database/cleaned/users.csv', 'users', 'userId', False)
csv_to_sql('backend/database/cleaned/userPersonality.csv', 'user_personality', 'useri', True)
csv_to_sql('backend/database/cleaned/stars.csv', 'stars', 'starId', False)
csv_to_sql('backend/database/cleaned/movies.csv', 'movies', 'movieId', False)
csv_to_sql('backend/database/cleaned/movieGenres.csv', 'movie_genres', 'movieGenreId', True)
csv_to_sql('backend/database/cleaned/movieTags.csv', 'movie_tags', 'movieTagId', True)
csv_to_sql('backend/database/cleaned/movieStars.csv', 'movie_stars', 'movieStarId', True)
csv_to_sql('backend/database/cleaned/ratings.csv', 'ratings', 'ratingId', True)
csv_to_sql('backend/database/cleaned/personalityRating.csv', 'personality_rating', 'ratingId', True)


# Combine INSERTs into initdb.sql
with open('scripts/initdb.sql', 'w') as outfile:
    
    # Append all INSERT files in dependency order
    for insert_file in ['scripts/insert/insert_genres.sql',
                        'scripts/insert/insert_directors.sql',
                        'scripts/insert/insert_tags.sql',
                        'scripts/insert/insert_users.sql',
                        'scripts/insert/insert_user_personality.sql',
                        'scripts/insert/insert_stars.sql',
                        'scripts/insert/insert_movies.sql',
                        'scripts/insert/insert_movie_genres.sql',
                        'scripts/insert/insert_movie_tags.sql',
                        'scripts/insert/insert_movie_stars.sql',
                        'scripts/insert/insert_ratings.sql',
                        'scripts/insert/insert_personality_rating.sql']:
        with open(insert_file, 'r') as infile:
            outfile.write('\n' + infile.read())