Personality 2018 Dataset > personality-data.csv
----------------------------------
1) Rename `userId` to `useri`
2) Retain only the columns: `useri`, `openness`, `agreebleness`, `emotional_stability`, `conscientiousness`, and `extraversion`
3) Remove dupliated value in `useri` - 14 rows were removed.
- Formula used: `=SUM(1/COUNTIF(A2:A1821,A2:A1821))`
4) Rename the csv file to `userPersonality.csv`

`userPersonality.csv` --- 1,820 records


-----------------------------------
-----------------------------------
Personality 2018 Dataset > ratings.csv
-----------------------------------
1) Rename the csv to `personalityRating.csv`
2) Rename `movie_id` to `movieId` and `tstamp` to `timestamp`
3) Validate the number of distinct `useri` using the formula: `=COUNTA(UNIQUE(FILTER(A2:A1028752, A2:A1028752<>"")))`
- There are 1820 distinct `useri`, which aligns with the `useri` in `userPersonality.csv`

`personalityRating.csv` --- 1,028,751 records

- There files contains 1,028,751 ratings on 35,196 distinct movies. However, we only have details for 9,742 movies in the `movies.csv`

4) Performed a `Left Outer` join on `personalityRating.csv` and `movies.csv` (described below) in Power Query in Excel. A total of 920,264 records remain.

5) Convert the timestamp format to `yyyy-mm-dd hh:mm:ss`

Working was saved as `personalityRating_WorkingShown.xlsx`

`personalityRating.csv` (updated) --- 920,264 records

-----------------------------------
-----------------------------------
MovieLens Latest Datasets > tags.csv
-----------------------------------
Part A - Convert timestamp from seconds since January 1, 1970 to exact datetime
1) Rename `timestamp` to `tstamp`
2) Convert `tstamp` from seconds since midnight Coordinated Universal Time (UTC) of January 1, 1970 to exact datetime, named as `timestamp`
- Excel formula: `=(E2 / 86400) + DATE(1970, 1, 1)`
- Custom format applied: `yyyy-mm-dd hh:mm:ss`

Part B -  Create a Tag-to-ID Mapping Table and Replace Tags with tagIds
1) Extract unique tags in column H: `=UNIQUE(C2:C3684)`
2) Assign Tag IDs in column I: `=ROW(I1)`
3) Replace tags with IDs in column C. Column D: `=VLOOKUP(C2, $H$2:$I$1476, 2, FALSE)`

Part C - Extract unique `userId` values to form the Users table
Extract unique user IDs into column K: `=UNIQUE(A2:A3684)`

Part D - Export csv
1) Rename `tags.csv` as `tags_workingShown.xlsx`
2) Export column H and column I (Tag-to-ID Mapping Table) as `tags.csv`
3) Export column A,B,D,F (tags made by each user on each movie) as `movieTags.csv`
4) Export column K (userId of users who wrote at least 1 tag) as `users.csv`

`movieTags.csv` --- 3,683 records
`tag.csv` --- 1,475 records
`users.csv` --- 58 records


-----------------------------------
-----------------------------------
MovieLens Latest Datasets > ratings.csv
-----------------------------------
Part A - Convert timestamp from seconds since January 1, 1970 to exact datetime
1) Rename `timestamp` to `tstamp`
2) Convert `tstamp` from seconds since midnight Coordinated Universal Time (UTC) of January 1, 1970 to exact datetime, named as `timestamp`
Excel formula: `=(D2 / 86400) + DATE(1970, 1, 1)` and use custom format `yyyy-mm-dd hh:mm:ss`

Part B - Extract unique `userId` values to form the Users table
Extract unique user IDs into column H: `=UNIQUE(A2:A100837)`

Part C - Export csv
1) Save as `ratings_workingShown.xlsx`
2) Export `userId`, `movieId`, `rating`, and `timestamp` columns as `ratings.csv`
3) Update `users.csv` with the union of column H (from this file) and column K (from `tags_workingShown.xlsx`)

`rating.csv` --- 100,836 records
`users.csv` (updated) --- 610 records

-----------------------------------
-----------------------------------
MovieLens Latest Datasets > movies.csv
-----------------------------------
Part A - Extract release year from the title column
1) open Power Query Editor in Excel and add a custom column: 
`= if Text.Contains([title], "(") and Text.EndsWith([title], ")") 
  then Text.Middle([title], Text.Length([title]) - 5, 4) 
  else null`

Part B - Clean the title column (Remove "(yyyy)")
1) Remove extra spaces before the delimiter in CSV by replacing all ` ,` with `,`
2) open Power Query Editor in Excel and add a custom column:
`=if Text.Length([title]) >= 6 and Text.EndsWith([title], ")") 
  then Text.Start([title], Text.Length([title]) - 7) 
  else [title]`

Part C - Split genres into rows from "genre1|genre2|genre3"
1) open Power Query Editor in Excel `Transform > Split Column > By Delimiter`
Choose `|` as the delimiter and choose `Rows` as the split type

Part D - Extract unique genres to form the genres table
1) Extract genre names in column F: `=UNIQUE(B2:B22085)`
2) Assign Genre IDs in column G: `=SEQUENCE(COUNTA(F2#))`

Part E - Match the genres for each movie to genreId
1) column C: `=VLOOKUP(B2, $F$2:$G$21, 2, FALSE)`

Part F - Export to csv
1) Save as a worksheet named as `movies` in `movies_workingShown.xlsx`
2) Export column F and G (Genre-to-ID Mapping Table) as `genres.csv`
3) Export column A and C (Movie-to-Genres Mapping Table) as `movieGenres.csv`

`genres.csv` --- 20 records
`movieGenres.csv` --- 22,084 records


-----------------------------------
-----------------------------------
MovieLens Latest Datasets > links.csv
-----------------------------------
Two `imdbId` value are outdated:
- `0118114` (movieId `720`, Wallace & Gromit: The Best of Aardman Animation) → Correct `imdbId`: `31416047`
- `1347439` (movieId `86668`, Louis Theroux: Law & Disorder) → Correct `imdbId`: `2585208`

1) Replace `0118114` with `31416047`
2) Replace `1347439` with `2585208`
3) Save as a worksheet named as `links` in `movies_workingShown.xlsx`


-----------------------------------
-----------------------------------
Cleaned_IMDb_Movies_Data.csv
-----------------------------------
Insert the csv as a worksheet named as `Cleaned_IMDb_Movies_Data` in `movies_workingShown.xlsx`

Part A - Extract unique Director to form the director table
1) column AA (director name): `=UNIQUE(K2:K9743)`
2) column AB (director ID): `=SEQUENCE(COUNTA(AA2#))`

Part B - Match the director for each movie to directorId
1) column L: `=VLOOKUP(K2, $AA$2:$AB$4028, 2, FALSE)`

Part C - Extract unique Star to form the star table
1) List all stars in a single column, column AE (star name): `=TOCOL(N2:Q9743, 1)`
2) Extract unique stars in column AF: `=UNIQUE(AE2:AE38969)`
3) Assign StarId in column AG: `=SEQUENCE(COUNTA(AF2#))`

Part D - Match the stars of each movie to starId
1) column R: `=IFERROR(VLOOKUP(N2, $AF$2:$AG$15671, 2, FALSE), "")`
1) column S: `=IFERROR(VLOOKUP(O2, $AF$2:$AG$15671, 2, FALSE), "")`
1) column T: `=IFERROR(VLOOKUP(P2, $AF$2:$AG$15671, 2, FALSE), "")`
1) column U: `=IFERROR(VLOOKUP(Q2, $AF$2:$AG$15671, 2, FALSE), "")`

Part E - Convert Box_Office to numerical values
1) column W: `=IF(V2="", "", VALUE(SUBSTITUTE(SUBSTITUTE(V2, "$", ""), ",", "")))`

Part F - Rename `Runtime` to `Runtime_Original` and convert it to numerical values in minutes
1) column H: 
`=IF(G2<>"",
    IF(ISNUMBER(SEARCH("hour", G2)),
        VALUE(LEFT(G2, FIND(" hour", G2)-1)) * 60 +
        IF(ISNUMBER(SEARCH("minute", G2)), VALUE(MID(G2, FIND("hour", G2)+5, FIND("minute", G2)-FIND("hour", G2)-5)), 0),
        VALUE(LEFT(G2, FIND(" minute", G2)-1))
    ),
"")`

Part G - Insert movieId for export
1) column A: `=XLOOKUP(B2, links!B:B, links!A:A)`

Part H - Export csv
1) Export column AA and AB (director table) as `directors.csv`
2) Export column AF and AG (star table) as `stars.csv`
3) Export column A, R, S, T, U (movie-to-star Mapping table) as `movieStars_Table` worksheet, unpivot columns using Power Query and save as `moviesStars.csv`
4) Export column A, B, C, F, H, J, L, W and column I, J, K in `movies` worksheet to `IMDb_data` worksheet and save as `movies.csv`

`directors.csv` --- 4,027 records
`stars.csv` --- 15,670 records
`movieStars.csv` --- 38,968 records
`movies.csv` --- 9,742 records