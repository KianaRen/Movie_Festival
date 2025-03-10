import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart as ReactChart } from 'react-chartjs-2';

Chart.register(MatrixController, MatrixElement);

function AudienceRating() {
  const [genreOptions, setGenreOptions] = useState([]);
  const [selectedGenreA, setSelectedGenreA] = useState(null);
  const [selectedGenreB, setSelectedGenreB] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);

   // Reset heatmap data when either genre changes
   useEffect(() => {
    setHeatmapData(null); // Clear previous data immediately when genres change
  }, [selectedGenreA, selectedGenreB]);

  // Fetch genre list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres-withId');
        const data = await response.json();
        setGenreOptions(data.map(genre => ({ value: genre.genreId, label: genre.genre })));
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch heatmap data
  useEffect(() => {
    const parseNumber = (value) => {
        const numericString = value.toString().replace(/[^0-9]/g, '');
        return parseInt(numericString, 10) || 0;
      };

    const fetchHeatmapData = async () => {
        if (!selectedGenreA?.value || !selectedGenreB?.value) {
            setHeatmapData(null); // Ensure plot is hidden if either genre is deselected
            return;
          }

      try {
        const response = await fetch(`/api/rating-correlation?genreA=${selectedGenreA.label}&genreB=${selectedGenreB.label}`);
        const apiData = await response.json();

        const highBoth = parseNumber(apiData.highBoth);
        const lowAHighB = parseNumber(apiData.lowAHighB);
        const highALowB = parseNumber(apiData.highALowB);
        const lowBoth = parseNumber(apiData.lowBoth);
        const totalUsers = parseNumber(apiData.totalUsers); 

        const calculatedTotal = highBoth + lowAHighB + highALowB + lowBoth;

        setHeatmapData({
            datasets: [{
              total: totalUsers,
              label: 'User Distribution',
              data: [
                { x: 'High', y: 'High', v: highBoth, raw: highBoth },
                { x: 'Low', y: 'High', v: lowAHighB, raw: lowAHighB },
                { x: 'High', y: 'Low', v: highALowB, raw: highALowB },
                { x: 'Low', y: 'Low', v: lowBoth, raw: lowBoth }
              ],
              backgroundColor: (context) => {
                const value = context.dataset.data[context.dataIndex].v;
                const values = context.dataset.data.map(d => d.v);
                const maxV = Math.max(...values);
                let alpha = 0.2; // Minimum alpha
                if (maxV > 0) {
                  alpha = Math.max(value / maxV * 0.8, 0.2); // Scale alpha relative to max value
                }
                return `rgba(54, 162, 235, ${alpha})`;
              },
              borderWidth: 0,
              borderColor: 'rgba(200, 200, 200, 0.3)',
              width: ({ chart }) => (chart.chartArea || {}).width / 2 - 1,
              height: ({ chart }) => (chart.chartArea || {}).height / 2 - 1
            }]
          });

      } catch (error) {
        console.error('API Error:', error);  setHeatmapData(null);
      }
    };
    fetchHeatmapData();
  }, [selectedGenreA, selectedGenreB]);

  const getFilteredOptions = useCallback((currentSelect) => {
    return genreOptions.filter(option => 
      option.value !== (currentSelect === 'A' 
        ? selectedGenreB?.value 
        : selectedGenreA?.value)
    );
  }, [genreOptions, selectedGenreA, selectedGenreB]);

  return (
    <div className="audience-rating" style={{ padding: '30px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: 30, textAlign: 'left' }}>
        <Link to="/analysis">
          <button style={{
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
          }}>
            ← Back to Analysis
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>
          Audience Rating Analysis
        </h2>

        {/* Genre Selectors */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <Select
            value={selectedGenreA}
            onChange={setSelectedGenreA}
            options={getFilteredOptions('A')}
            placeholder="Select first genre..."
            isClearable
            styles={selectStyles}
          />
          
          <Select
            value={selectedGenreB}
            onChange={setSelectedGenreB}
            options={getFilteredOptions('B')}
            placeholder="Select second genre..."
            isClearable
            styles={selectStyles}
          />
        </div>

        {heatmapData && (
          <div style={{ 
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'rgba(248, 248, 248, 0.97)',
            borderRadius: '8px'
          }}>
            <div style={{ height: '400px', position: 'relative' }}>
              <ReactChart
                type="matrix"
                data={heatmapData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const data = context[0].dataset.data[context[0].dataIndex];
                                return `${selectedGenreA?.label} ${data.y} / ${selectedGenreB?.label} ${data.x}`;
                              },
                            label: (context) => {
                                const data = context.dataset.data[context.dataIndex];
                                const total = context.dataset.total;
                                const percentage = (data.v / total) * 100;
                                return `${data.raw} users (${percentage.toFixed(1)}%)`;
                              }
                          }
                        }
                      },
                  scales: {
                    x: {
                        type: 'category',
                        labels: ['Low', 'High'],
                        offset: true,
                        title: {
                          display: true,
                          text: `${selectedGenreB?.label} Ratings`,
                          color: 'black'
                        },
                        ticks: { color: 'black' }
                      },
                      y: {
                        type: 'category',
                        labels: ['High', 'Low'],
                        reverse: false,
                        offset: true,
                        title: {
                          display: true,
                          text: `${selectedGenreA?.label} Ratings`,
                          color: 'black'
                        },
                        ticks: { color: 'black' }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// Dropdown styling
const selectStyles = {
  control: (base) => ({
    ...base,
    border: '1px solid #ddd',
    backgroundColor: 'rgba(40, 40, 40, 0.97)',
    color: 'white',
    boxShadow: 'none',
    '&:hover': { borderColor: '#3d3d3d' }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgba(40, 40, 40, 0.97)',
    border: '1px solid #2d2d2d'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? 'rgba(116, 170, 250, 0.5)' 
      : state.isFocused 
      ? 'rgba(100, 100, 100, 0.2)' 
      : 'transparent',
    color: 'white',
    '&:active': { backgroundColor: 'rgba(116, 170, 250, 0.3)' }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#888'
  })
};

export default AudienceRating;