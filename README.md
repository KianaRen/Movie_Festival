# Movie_Festival

# Part A - Setup the Database
1. Create a file named `.env` in the root directory.

Example:
```
MYSQL_ROOT_PASSWORD=root1234
MYSQL_DATABASE=movie_festival
MYSQL_USER=app_user
MYSQL_PASSWORD=user_password
```

2. Pull `initdb.sql` from LFS to insert data into the database upon container creation:
```
git lfs pull --include="scripts/initdb.sql"
```

Alternatively, you can pull all the cleaned csv and run `CSV_to_INSERT.py`. This will generate the same `initdb.sql`:
```
git lfs pull --include="database/cleaned/*"
python3 scripts/CSV_to_INSERT.py
```

3. Build and start the container:
```
docker-compose up -d
```

Depending on your hardware, it might take up to 20 minutes to initialise the database, as there are over 1 million SQL `INSERT` statements in `initdb.sql` to populate the entire database.

4. You should expect the following number of records for each of the entity if the setup is correct:
```
+--------------------+------------+
| TABLE_NAME         | TABLE_ROWS |
+--------------------+------------+
| directors          |       4027 |
| genres             |         20 |
| list_movies        |          2 |
| lists              |          1 |
| movie_genres       |      22654 |
| movie_stars        |      36908 |
| movie_tags         |       3683 |
| movies             |       9465 |
| personality_rating |     916082 |
| planner_user       |          1 |
| ratings            |     100936 |
| stars              |      15619 |
| tags               |       1475 |
| user_personality   |       1820 |
| users              |        610 |
+--------------------+------------+
```

# Data Description (to be added)