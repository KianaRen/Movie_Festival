import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import Select from 'react-select';
import { Link } from 'react-router-dom';

function ViewerPersonality() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Fetch genre list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres');
        const data = await response.json();
        setGenres(data.genres.map(genre => ({ value: genre, label: genre })));
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch personality data for selected genres
  useEffect(() => {
    const fetchPersonalityData = async () => {
      if (selectedGenres.length === 0) return;

      try {
        const responses = await Promise.all(
          selectedGenres.map(genre => 
            fetch(`/api/viewer-personality?genre=${encodeURIComponent(genre.value)}`)
          )
        );
        
        const dataArray = await Promise.all(responses.map(r => r.json()));
        
        const datasets = dataArray.map((data, index) => ({
          label: data.genre,
          data: [
            data.avg_openness,
            data.avg_agreeableness,
            data.avg_emotional_stability,
            data.avg_conscientiousness,
            data.avg_extraversion
          ],
          backgroundColor: `rgba(64, ${150 + index*50}, 255, 0.2)`,
          borderColor: `rgba(64, ${150 + index*50}, 255, 1)`,
          borderWidth: 2
        }));

        setChartData({
          labels: ['Openness', 'Agreeableness', 'Emotional Stability', 'Conscientiousness', 'Extraversion'],
          datasets
        });
      } catch (error) {
        console.error('Error fetching personality data:', error);
      }
    };

    fetchPersonalityData();
  }, [selectedGenres]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 3.5,  // Axis range
        suggestedMax: 4.5,  // Axis max range
        ticks: { stepSize: 0.2 , font: {size: 12} , backdropColor: 'transparent', color: '#333' },  //Axis scale
        pointLabels: { font: {size:14}, color:'#333' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12 }
      }
    }
  };

  return (
    <div className="viewer-personality" style={{ padding: '30px' }}>
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

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Viewer Personality Traits by Genre</h2>
        
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Select
            isMulti
            options={genres}
            value={selectedGenres}
            onChange={selected => setSelectedGenres(selected.slice(0, 3))}
            placeholder="Select up to 3 genres..."
            styles={{
              control: (base) => ({
                ...base,
                minWidth: '300px',
                border: '1px solid #ddd',
                backgroundColor: 'rgba(40, 40, 40, 0.97)',
                color: 'white',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#3d3d3d'
                }
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
                '&:active': {
                  backgroundColor: 'rgba(116, 170, 250, 0.3)'
                }
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: 'rgba(116, 170, 250, 0.3)',
                borderRadius: '4px'
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: 'white'
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }),
              placeholder: (base) => ({
                ...base,
                color: '#888'
              }),
              singleValue: (base) => ({
                ...base,
                color: 'white'
              }),
              input: (base) => ({
                ...base,
                color: 'white'
              })
            }}
            closeMenuOnSelect={false}
          />
        </div>

        {chartData && (
          <div style={{ 
            backgroundColor: 'rgba(245, 243, 243, 0.97)',
            padding: '40px 30px',
            borderRadius: '8px',
            height: '600px',
            position: 'relative'
          }}>
            <Radar
              data={chartData}
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewerPersonality;