import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { theme } = useContext(ThemeContext); 
  const navigate = useNavigate();

  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  const fetchSuggestions = useCallback(debounce(async (query) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/movies/search`, {
        params: { query, type: 'movie' }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, 700), []);

  useEffect(() => {
    if (query.length > 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, fetchSuggestions]);

  const handleSearch = async () => {
    setNoResults(false);
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/movies/search`, {
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
    navigate(`/movie/${suggestion.imdbID}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`search-bar-container ${theme}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search by movie or actor"
        className="search-bar-input"
      />
      <button onClick={handleSearch} className="search-bar-button">Search</button>
      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.imdbID}
              onClick={() => handleSuggestionClick(suggestion)}
              className="search-suggestion"
            >
              {suggestion.title} 
            </li>
          ))}
        </ul>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="search-results-container">
          {noResults ? (
            <p className="no-results-text">No movies available</p>
          ) : (
            <div className="results-slider">
              {searchResults.map((movie) => (
                <div key={movie.imdbID} className="result-card">
                  <Link to={`/movie/${movie.imdbID}`} className="result-link">
                    <h2 className="result-title">{movie.title}</h2> 
                    <p className="result-year">{movie.year}</p>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="result-poster"
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

export default SearchBar;
