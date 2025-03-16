import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';

function PredictRatings() {
  const [selectedOptionA, setSelectedOptionA] = useState([]);
  const [selectedOptionB, setSelectedOptionB] = useState(null);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [coefficients, setCoefficients] = useState({});
  const [prediction, setPrediction] = useState(null);

  // Fetch genre list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres-withId');
        const data = await response.json();
        setGenres(data.map(genre => ({ value: genre.genreId, label: genre.genre })));
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch popular tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/popular-tags');
        const data = await response.json();
        setTags(data.map(tag => ({ value: tag.tagId, label: tag.tag })));
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // Fetch coefficients when component mounts
  useEffect(() => {
    const fetchCoefficients = async () => {
      try {
        const response = await fetch('/api/trainLM');
        if (!response.ok) throw new Error('Failed to fetch coefficients');
        const data = await response.json();
        if (data.success) {
          const coeffMap = {};
          data.coefficients.names.forEach((name, index) => {
            coeffMap[name.toString()] = data.coefficients.values[index];
          });
          setCoefficients(coeffMap);
        }
      } catch (error) {
        console.error('Error fetching coefficients:', error);
      }
    };
    fetchCoefficients();
  }, []);

  // Calculate prediction when selections or coefficients change
  useEffect(() => {
    if (Object.keys(coefficients).length === 0) return;

    // Return null if nothing is selected
    const hasSelection = selectedOptionA.length > 0 || (selectedOptionB && selectedOptionB.length > 0);
    if (!hasSelection) {
      setPrediction(null);
      return;
    }

    const constTerm = coefficients['const'] || 0;
    const selectedGenres = selectedOptionA.map(opt => opt.value);
    const selectedTags = selectedOptionB ? selectedOptionB.map(opt => opt.value) : [];

    const genreSum = selectedGenres.reduce((sum, id) => 
      sum + (coefficients[id.toString()] || 0), 0);
    const tagSum = selectedTags.reduce((sum, id) => 
      sum + (coefficients[id.toString()] || 0), 0);

    // Calculate raw prediction and clamp between 0.5 and 5
    const rawPrediction = constTerm + genreSum + tagSum;
    const clampedPrediction = Math.max(0.5, Math.min(5, rawPrediction));

    setPrediction(clampedPrediction);
  }, [selectedOptionA, selectedOptionB, coefficients]);

  return (
    <div className="predict-ratings" style={{ padding: '30px' }}>
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
          Predict Ratings for a New Movie
        </h2>

        {/* Dropdown Selectors */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <Select
            isMulti
            options={genres}
            value={selectedOptionA}
            onChange={selected => setSelectedOptionA(selected.slice(0, 5))}
            placeholder="Select up to 5 genres..."
            styles={selectStyles}
            isClearable
            closeMenuOnSelect={false}
          />
          
          <Select
            isMulti
            options={tags}
            value={selectedOptionB}
            onChange={setSelectedOptionB}
            placeholder="Select tags..."
            styles={selectStyles}
            isClearable
            closeMenuOnSelect={false}
          />
        </div>

        {/* Prediction Display */}
        {prediction !== null && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'rgba(40, 40, 40, 0.97)',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: 0, color: 'white' }}>
              Predicted Rating: {prediction.toFixed(2)}
            </h3>
            </div>
        )}
      </div>
    </div>
  );
}

// Reused styles with multi-select support
const selectStyles = {
    control: (base) => ({
      ...base,
      minWidth: '300px',
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
  };

export default PredictRatings;