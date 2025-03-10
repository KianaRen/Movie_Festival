import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Link } from 'react-router-dom';

function GenreRatings() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [ratingData, setRatingData] = useState(null);
  const selectedGenreName = genres.find((genre) => genre.genreId.toString() === selectedGenre)?.genre || 'Selected Genre';

  // Fetch list of genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres-withId');
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch rating distribution when genre is selected
  useEffect(() => {
    const fetchRatingData = async () => {
      if (!selectedGenre) return;

      try {
        const response = await fetch(`/api/genre-ratings?genreId=${encodeURIComponent(selectedGenre)}`);
        const data = await response.json();
        setRatingData(data);
      } catch (error) {
        console.error('Error fetching rating data:', error);
      }
    };

    fetchRatingData();
  }, [selectedGenre]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ratings'
        }
      },
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Star Rating',
          padding: 10
        }
      }
    },
    layout: {
      padding: {
        bottom: 20
      }
    }
  };

  // Create chart data structure
  const createChartData = (data) => {
   // Define all possible ratings in correct order
   const allRatings = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'];
    
   // Create map from API data
   const dataMap = new Map(data.map(item => [
     item.rating.toString(), // Convert to string to match categories
     item.frequency
   ]));

   // Generate ordered data with 0 for missing ratings
   const orderedData = allRatings.map(rating => 
     dataMap.get(rating) || 0
   );

   return {
     labels: allRatings,
     datasets: [{
       data: orderedData,
       backgroundColor: 'rgba(255, 159, 64, 0.5)',
       borderWidth: 1
     }]
   };
 };

  return (
    <div className="genre-ratings" style={{ padding: '30px' }}>
      {/* Back button */}
      <div style={{ marginBottom: 30, textAlign: 'left' }}>
        <Link to="/reports">
          <button 
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(116, 170, 250, 0.97)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 16,
              transition: 'background-color 0.3s',
              ':hover': {
                backgroundColor: 'rgba(79, 148, 252, 0.97)'
              }
            }}
          >
            ← Back to Reports
          </button>
        </Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Rating Distribution by Genre</h2>
        
        {/* Genre selection dropdown */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            <option value="">Select a Genre</option>
            {genres.map(genre => (
              <option key={genre.genreId} value={genre.genreId}>{genre.genre}</option>
            ))}
          </select>
        </div>

        {/* Chart */}
        {ratingData && (
          <div style={{ 
            backgroundColor: 'rgba(245, 243, 243, 0.97)', 
            padding: '30px', 
            borderRadius: '8px',  
            height: '500px', 
            position: 'relative'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' , color: '#333'}}>
              Rating Distribution for {selectedGenreName}
            </h3>
            <Bar
              data={createChartData(ratingData)}
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GenreRatings;