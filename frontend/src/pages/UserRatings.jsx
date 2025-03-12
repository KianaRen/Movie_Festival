import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { Link } from 'react-router-dom';
import Select from 'react-select';

function UserRatings() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all users with ratings
  useEffect(() => {
    fetch('/api/users-with-ratings')
      .then(res => res.json())
      .then(data => setUsers(data.map(u => u.userId)))
      .catch(console.error);
  }, []);

  // Handle user selection
  const handleUserChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedUser(null);
      setChartData(null);
      return;
    }

    const userId = selectedOption.value;
    setSelectedUser(selectedOption);
    setLoading(true);

    fetch(`/api/user-genre-ratings?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const genreMap = {};
        let yIndex = 0;
        const positionMap = new Map();
        
        // First pass: map all positions and count collisions
        data.ratings.forEach(item => {
          // Round coordinates to 2 decimal places for grouping
          const x = Number(item.rating.toFixed(2));
          const y = item.genre;
    
          if (!genreMap[y]) {
            genreMap[y] = yIndex++;
          }
    
          const yPosition = genreMap[y];
          const key = `${x}-${yPosition}`;
          positionMap.set(key, (positionMap.get(key) || 0) + 1);
        });

        // Second pass: create dataset with conditional jitter
        const dataset = data.ratings.reduce((acc, item) => {
          const genreKey = item.genre;
          const yPosition = genreMap[genreKey];
          const x = Number(item.rating.toFixed(2));
          const key = `${x}-${yPosition}`;
          const count = positionMap.get(key) || 0;

          // Apply jitter only if multiple points share same grid position
          const jitterX = count > 1 ? (Math.random() * 0.1 - 0.05) : 0;
          const jitterY = count > 1 ? (Math.random() * 0.1 - 0.05) : 0;

          acc.push({
            x: x + jitterX,
            y: yPosition + jitterY,
          });
          return acc;
        }, []);

        setChartData({
          labels: Object.keys(genreMap),
          datasets: [{
            label: `Viewer ${userId} Ratings`,
            data: dataset,
            backgroundColor: 'rgba(204, 57, 89, 0.83)',
            borderWidth: 1
          }]
        });
      })
      .finally(() => setLoading(false));
  };

  // Chart configuration (keep existing options)
  const chartOptions = {
    plugins: {
      tooltip: { enabled: false },
      decimation: { enabled: true }
    },
    elements: {
      point: {
        radius: 2.5,
        hoverRadius: 5
      }
    },
    scales: {
      y: {
        type: 'category',
        ticks: {
          callback: (value) => chartData?.labels[Math.round(value)] || ''
        },
        title: { display: true, text: 'Genres' },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: 6,
        ticks: {
          stepSize: 0.5,
          callback: function(value) {
            // Show labels for all 0.5 increments
            return value % 1 === 0 ? value.toFixed(1) : value.toFixed(1);
          }
        },
        title: {
          display: true,
          text: 'Ratings'
        },
        grid: {
          color: (ctx) => 
            ctx.tick.value % 1 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="user-ratings" style={{ padding: '30px' }}>
      {/* Back button */}
      <div style={{ marginBottom: 30, textAlign: 'left' }}>
        <Link to="/audience-rating">
          <button style={buttonStyle}>
            ← Back to Audience Rating Analysis
          </button>
        </Link>
      </div>

      {/* Title and Dropdown */}
      <div style={{ 
        marginBottom: 40, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Viewer Rating History
        </h2>
        
        <div style={{ width: '300px' }}>
          <Select
            value={selectedUser}
            onChange={handleUserChange}
            options={users.map(userId => ({
              value: userId,
              label: `Viewer ${userId}`
            }))}
            isClearable
            placeholder="Select a User..."
            styles={customSelectStyles}
          />
        </div>
      </div>

      {/* Chart display with background */}
      {loading && <p>Loading ratings...</p>}
      {chartData && (
        <div style={{ 
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ height: '500px' }}>
            <Scatter data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

// Styling constants
const buttonStyle = {
  padding: '12px 24px',
  backgroundColor: 'rgba(116, 170, 250, 0.97)',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: 16,
  transition: 'background-color 0.3s',
};

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: '#2d2d2d',
    borderColor: '#404040',
    color: 'white',
    borderRadius: '4px',
    minHeight: '40px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#4a4a4a' }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#2d2d2d',
    border: '1px solid #404040',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }),
  option: (base, state) => ({
    ...base,
    color: 'white',
    backgroundColor: state.isSelected 
      ? 'rgba(116, 170, 250, 0.8)'
      : state.isFocused 
      ? 'rgba(100, 100, 100, 0.3)'
      : 'transparent',
    '&:active': { backgroundColor: 'rgba(116, 170, 250, 0.5)' }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#888'
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#888',
    '&:hover': { color: '#fff' }
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: '#404040'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#888',
    '&:hover': { color: '#fff' }
  })
};

export default UserRatings;