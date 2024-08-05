import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css'; 

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchRecentMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/movies/recent');
      console.log('Recent Movies:', response.data);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching recent movies:', error);
    }
  };

  useEffect(() => {
    fetchRecentMovies();
  }, []);

  return (
    <div>
      <h1>Recent Movies</h1>
      <div>
        {movies.length === 0 ? (
          <p>No recent movies available.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.imdbID} onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`)} style={{ cursor: 'pointer', marginBottom: '10px' }}>
              <h2>{movie.title}</h2>
              <p>{movie.releaseDate}</p>
              <img src={movie.poster} alt={movie.title} />
            </div>
          ))
        )}
      </div>

      {selectedMovie && (
        <div>
          <h1>{selectedMovie.title}</h1>
          <p><strong>Release Date:</strong> {new Date(selectedMovie.releaseDate).toLocaleDateString()}</p>
          <img src={selectedMovie.poster} alt={selectedMovie.title} />
        </div>
      )}
    </div>
  );
};

export default MovieList;
