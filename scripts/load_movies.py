import pandas as pd
import re
from sqlalchemy import create_engine

# ✅ Database connection details
DATABASE_URL = "mysql+pymysql://root@localhost/movie_festival"
engine = create_engine(DATABASE_URL)

# ✅ Load CSV file
csv_path = "database/Cleaned_IMDb_Movies_Data.csv"
df = pd.read_csv(csv_path)

# ✅ Rename columns to match MySQL schema
df = df.rename(columns={
    "Series_Title": "title",
    "Released_Year": "releaseYear",
    "IMDB_Rating": "criticScore",
    "Box_Office": "boxOffice",
    "Poster_Link": "posterURL",
    "Director": "director",
    "Runtime": "runtime",
})

# ✅ Drop unnecessary columns
df = df[['title', 'releaseYear', 'director', 'runtime', 'boxOffice', 'criticScore', 'posterURL']]

# ✅ Remove rows where the title is missing
df = df.dropna(subset=['title'])

# ✅ Convert `runtime` to `HH:MM:SS` format
def convert_runtime(runtime):
    """ Convert runtime from minutes to HH:MM:SS format """
    match = re.search(r'(\d+)', str(runtime))  # Extract number of minutes
    if match:
        minutes = int(match.group(1))
        hours = minutes // 60
        mins = minutes % 60
        return f"{hours:02}:{mins:02}:00"  # Convert to HH:MM:SS
    return None  # Return None for invalid values

df['runtime'] = df['runtime'].apply(convert_runtime)

# ✅ Convert `boxOffice` to numeric (remove $ and commas)
df['boxOffice'] = df['boxOffice'].replace('[\$,]', '', regex=True).astype(float, errors='ignore')

# ✅ Print preview before inserting
print("🔥 Final preview before inserting:")
print(df[['title', 'releaseYear', 'director', 'runtime', 'boxOffice', 'criticScore', 'posterURL']].head())

# ✅ Insert into MySQL in batches
try:
    print("🔥 Inserting data into MySQL...")
    df.to_sql("movies", con=engine, if_exists="append", index=False, chunksize=500)
    print("✅ Data successfully inserted into 'movies' table!")
except Exception as e:
    print(f"❌ ERROR: {e}")

