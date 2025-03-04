import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Link } from 'react-router-dom';

function Reports() {
  const [moviesPerGenre, setMoviesPerGenre] = useState(null);
  const [avgBoxOffice, setAvgBoxOffice] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [extremeRatings, setExtremeRatings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/stats/movies-per-genre'),
          fetch('/api/stats/avg-boxoffice'),
          fetch('/api/stats/avg-rating'),
          fetch('/api/stats/extreme-ratings')
        ]);
        
        const data = await Promise.all(responses.map(res => res.json()));
        setMoviesPerGenre(data[0]);
        setAvgBoxOffice(data[1]);
        setAvgRating(data[2]);
        setExtremeRatings(data[3]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const createChartData = (labels, data, label, backgroundColor) => ({
    labels,
    datasets: [{
      label,
      data,
      backgroundColor,
      borderWidth: 1,
    }]
  });

  return (
    <div className="reports" style={{ padding: '30px' }}>

      {/* Botton */}
      <div style={{ marginBottom: 30, textAlign: 'right' }}>
        <Link to="/genre-ratings">
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
                backgroundColor: '#1976D2'
              }
            }}
          >
            View Genre Ratings ➔
          </button>
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', maxWidth: '1200px', margin: '0 auto'}}>
        {/* Movies per Genre */}
        <div style={{ backgroundColor: 'rgba(245, 243, 243, 0.97)', padding: '30px', borderRadius: '8px',  height: '400px', position: 'relative' }}>
          <h3 style={{ color: 'black' }}>Movies per Genre</h3>
          {moviesPerGenre && (
            <Bar
              data={createChartData(
                moviesPerGenre.map(item => item.genre),
                moviesPerGenre.map(item => item.count),
                'Number of Movies',
                'rgba(54, 162, 235, 0.5)'
              )}
              options={chartOptions}
            />
          )}
        </div>

        {/* Average Box Office */}
        <div style={{ backgroundColor: 'rgba(245, 243, 243, 0.97)', padding: '30px', borderRadius: '8px',  height: '400px', position: 'relative' }}>
          <h3 style={{ color: 'black' }}>Average Box Office per Genre ($)</h3>
          {avgBoxOffice && (
            <Bar
              data={createChartData(
                avgBoxOffice.map(item => item.genre),
                avgBoxOffice.map(item => item.average),
                'Average Box Office',
                'rgba(255, 99, 132, 0.5)'
              )}
              options={chartOptions}
            />
          )}
        </div>

        {/* Average Rating */}
        <div style={{ backgroundColor: 'rgba(245, 243, 243, 0.97)', padding: '30px', borderRadius: '8px',  height: '400px', position: 'relative' }}>
          <h3 style={{ color: 'black' }}>Average Rating per Genre</h3>
          {avgRating && (
            <Bar
              data={createChartData(
                avgRating.map(item => item.genre),
                avgRating.map(item => item.average),
                'Average Rating',
                'rgba(75, 192, 192, 0.5)'
              )}
              options={chartOptions}
            />
          )}
        </div>

        {/* Extreme Ratings */}
        <div style={{ backgroundColor: 'rgba(245, 243, 243, 0.97)', padding: '30px', borderRadius: '8px',  height: '400px', position: 'relative' }}>
          <h3 style={{ color: 'black' }}>Percentage of Extreme Ratings (0.5 or 5 stars)</h3>
          {extremeRatings && (
            <Bar
              data={createChartData(
                extremeRatings.map(item => item.genre),
                extremeRatings.map(item => item.percentage),
                'Percentage %',
                'rgba(153, 102, 255, 0.5)'
              )}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Percentage (%)'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;