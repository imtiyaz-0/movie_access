import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import LoadingSpinner from './LoadingSpinner';
import { ThemeContext } from '../context/ThemeContext'; 
import { AuthContext } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const { theme } = useContext(ThemeContext); 
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/movies/movie/${id}` , {  withCredentials: true  });
        setMovie(response.data);
        console.log (response.data);
      } catch (error) {
        if(error.response.status === 401)(
          navigate('/login', { state: { from: `/movie/${id}` }, replace: true })
                )
        console.error('Error fetching movie details:', error);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (!movie) return <LoadingSpinner />;

  const displayIfNotNA = (value) => {
    return value && value !== 'N/A' ? value : null;
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.content(theme)}>
        <h1 style={styles.title(theme)}>{displayIfNotNA(movie.Title)}</h1>
        {displayIfNotNA(movie.Poster) && <img src={movie.Poster} alt={movie.Title} style={styles.poster} />}
        <div style={styles.details(theme)}>
          {displayIfNotNA(movie.Year) && <p><strong>Year:</strong> {movie.Year}</p>}
          {displayIfNotNA(movie.Rated) && <p><strong>Rated:</strong> {movie.Rated}</p>}
          {displayIfNotNA(movie.Released) && <p><strong>Release Date:</strong> {moment(movie.Released).format('MMMM Do YYYY')}</p>}
          {displayIfNotNA(movie.Runtime) && <p><strong>Runtime:</strong> {movie.Runtime}</p>}
          {displayIfNotNA(movie.Genre) && <p><strong>Genre:</strong> {movie.Genre}</p>}
          {displayIfNotNA(movie.Director) && <p><strong>Director:</strong> {movie.Director}</p>}
          {displayIfNotNA(movie.Writer) && <p><strong>Writer:</strong> {movie.Writer}</p>}
          {displayIfNotNA(movie.Actors) && <p><strong>Actors:</strong> {movie.Actors}</p>}
          {displayIfNotNA(movie.Plot) && <p><strong>Plot:</strong> {movie.Plot}</p>}
          {displayIfNotNA(movie.Language) && <p><strong>Language:</strong> {movie.Language}</p>}
          {displayIfNotNA(movie.Country) && <p><strong>Country:</strong> {movie.Country}</p>}
          {displayIfNotNA(movie.Awards) && <p><strong>Awards:</strong> {movie.Awards}</p>}
          {displayIfNotNA(movie.Metascore) && <p><strong>Metascore:</strong> {movie.Metascore}</p>}
          {displayIfNotNA(movie.imdbRating) && <p><strong>IMDB Rating:</strong> {movie.imdbRating}</p>}
          {displayIfNotNA(movie.imdbVotes) && <p><strong>IMDB Votes:</strong> {movie.imdbVotes}</p>}
          {displayIfNotNA(movie.imdbID) && <p><strong>IMDB ID:</strong> {movie.imdbID}</p>}
          {displayIfNotNA(movie.Type) && <p><strong>Type:</strong> {movie.Type}</p>}
          {displayIfNotNA(movie.DVD) && <p><strong>DVD Release:</strong> {movie.DVD}</p>}
          {displayIfNotNA(movie.BoxOffice) && <p><strong>Box Office:</strong> {movie.BoxOffice}</p>}
          {displayIfNotNA(movie.Production) && <p><strong>Production:</strong> {movie.Production}</p>}
          {displayIfNotNA(movie.Website) && <p><strong>Website:</strong> <a href={movie.Website} target="_blank" rel="noopener noreferrer">{movie.Website}</a></p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: (theme) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#333' : '#f4f4f4',
    color: theme === 'dark' ? '#f4f4f4' : '#333',
    transition: 'background-color 0.3s, color 0.3s',
  }),
  content: (theme) => ({
    maxWidth: '600px',
    width: '100%',
    backgroundColor: theme === 'dark' ? '#444' : '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 0 10px rgba(0, 0, 0, 0.5)' : '0 0 10px rgba(0, 0, 0, 0.1)',
  }),
  title: (theme) => ({
    fontSize: '2rem',
    marginBottom: '20px',
    textAlign: 'center',
    color: theme === 'dark' ? '#f4f4f4' : '#333',
  }),
  poster: {
    width: '500px',
    height: '600px',
    marginLeft: '50px',
    marginBottom: '20px',
    borderRadius: '8px',
    marginRight: '50px',
  },
  details: (theme) => ({
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: '1.6',
    color: theme === 'dark' ? '#f4f4f4' : '#333',
  }),
};

export default MovieDetails;
