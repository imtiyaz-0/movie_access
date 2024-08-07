import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { ThemeContext } from '../context/ThemeContext'; // Adjust the import based on your file structure

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { theme } = useContext(ThemeContext); // Get the current theme

  useEffect(() => {
    if (query.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/api/movies/search`, {
        params: { query, type: 'movie' }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async () => {
    setNoResults(false);
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/api/movies/search`, {
        params: { query, type: 'movie' }
      });
      if (response.data.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
        setSearchResults(response.data);
      }
    } catch (error) {
      setNoResults(true);
      console.error('Error fetching search results:', error);
    }
    setQuery('');
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery('');
    setSuggestions([]);
    setSearchResults([suggestion]);
    setNoResults(false);
  };

  return (
    <div style={styles.container(theme)}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by movie or actor"
        style={styles.input(theme)}
      />
      <button onClick={handleSearch} style={styles.button(theme)}>Search</button>
      {suggestions.length > 0 && (
        <ul style={styles.suggestions(theme)}>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.imdbID}
              onClick={() => handleSuggestionClick(suggestion)}
              style={styles.suggestion(theme)}
            >
              {suggestion.Title}
            </li>
          ))}
        </ul>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={styles.resultsContainer(theme)}>
          {noResults ? (
            <p style={styles.noResultsText(theme)}>No movies available</p>
          ) : (
            <div style={styles.resultsSlider}>
              {searchResults.map((movie) => (
                <div key={movie.imdbID} style={styles.resultCard(theme)}>
                  <Link to={`/movie/${movie.imdbID}`} style={styles.link}>
                    <h2 style={styles.resultTitle(theme)}>{movie.Title}</h2>
                    <p style={styles.resultYear(theme)}>{movie.Year}</p>
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      style={styles.resultPoster}
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: (theme) => ({
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: theme === 'dark' ? '#333' : '#f4f4f4',
    color: theme === 'dark' ? '#f4f4f4' : '#333',
    transition: 'background-color 0.3s, color 0.3s',
  }),
  input: (theme) => ({
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: theme === 'dark' ? '#555' : '#fff',
    color: theme === 'dark' ? '#ddd' : '#333',
  }),
  button: (theme) => ({
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }),
  suggestions: (theme) => ({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: theme === 'dark' ? '#444' : '#fff',
    maxHeight: '200px',
    overflowY: 'auto',
  }),
  suggestion: (theme) => ({
    padding: '10px',
    cursor: 'pointer',
    color: theme === 'dark' ? '#ddd' : '#333',
  }),
  resultsContainer: (theme) => ({
    marginTop: '20px',
  }),
  noResultsText: (theme) => ({
    color: theme === 'dark' ? '#ddd' : '#333',
  }),
  resultsSlider: {
    display: 'flex',
    overflowX: 'auto',
    padding: '10px 0',
  },
  resultCard: (theme) => ({
    backgroundColor: theme === 'dark' ? '#444' : '#fff',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    borderRadius: '8px',
    padding: '15px',
    marginRight: '15px',
    flex: '0 0 auto',
  }),
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  resultTitle: (theme) => ({
    fontSize: '1.5rem',
    margin: '0 0 10px',
    color: theme === 'dark' ? '#fff' : '#333',
  }),
  resultYear: (theme) => ({
    margin: '0 0 10px',
    color: theme === 'dark' ? '#ccc' : '#666',
  }),
  resultPoster: {
    width: '100px',
    borderRadius: '4px',
  },
};

export default SearchBar;
