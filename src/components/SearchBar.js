import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; 

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async () => {
    setNoResults(false);
    if (!query) return;

    try {
      const response = await axios.get('http://localhost:5001/api/movies/search', {
        params: { query, type: 'movie' } 
      });
      if(response.data.length===0){
        setNoResults(true);
      }else{
        setSearchResults(false);
      }
      setSearchResults(response.data);
    } catch (error) {
      setNoResults(true);
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by movie, actor, or series"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        { noResults?(<p>No movies available</p>): (searchResults.map((movie) => (
          <div
            key={movie.imdbID}
            onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`)} 
            style={{ cursor: 'pointer', marginBottom: '10px' }}
          >
            <h2>{movie.Title}</h2>
            <p>{movie.Year}</p>
            <img src={movie.Poster} alt={movie.Title} style={{ width: '100px' }} />
          </div>
        )))}
      </div>
    </div>
  );
};

export default SearchBar;
