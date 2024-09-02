import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/MovieList.css'; 
import moment from 'moment';
import LoadingSpinner from './LoadingSpinner';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
   const [selectedMovie, setSelectedMovie] = useState(null);
  const [Loading , setLoading] = useState(true);

  const fetchRecentMovies = async () => {
    try {
      const response = await axios.get(`http://localhost:${process.env.REACT_APP_PORT}/api/movies/recent`);
      console.log('Recent Movies:', response.data);
      setMovies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent movies:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentMovies();
  }, []);
 
  if(Loading) return <LoadingSpinner/>;

  return (
    <div className="movie-list-container">
      <h1 className="movie-list-title">Recent Movies</h1>
      <div className="movie-grid">
        {movies.length === 0 ? (
          <p className="no-movies">No recent movies available.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.imdbID} className="movie-item">
              <Link to={`/movie/${movie.imdbID}`} className="movie-link">
                <h2 className="movie-title">{movie.title}</h2>
                <p className="movie-release-date">{moment(movie.releaseDate).format('MMMM Do YYYY')}</p>
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieList;