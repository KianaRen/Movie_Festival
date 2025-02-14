import pandas as pd

# Load the CSV
csv_path = "database/Cleaned_IMDb_Movies_Data.csv"
df = pd.read_csv(csv_path)

# Print column names (to ensure correct names)
print("📝 Columns in CSV:", df.columns)

# Check if any title is missing
missing_titles = df[df['Series_Title'].isnull()]
print("❌ Missing Titles (First 10 rows):")
print(missing_titles.head(10))

# Count how many rows are missing a title
print(f"❌ Total rows with missing titles: {missing_titles.shape[0]}")

