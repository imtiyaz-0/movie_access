const express = require('express');
const axios = require('axios');
const Movie = require('../models/Movie');
const router = express.Router();
const logger = require('../logger');
const moment = require('moment');
const authMiddleware = require('../middleware/authMiddleware');

const fetchMoviesFromAPIs = async (queryParams) => {
  const apiUrl1 = process.env.apiUrl1; 
  const apiUrl2 = `${process.env.apiUrl2}3/search/movie`; 

  const apiKey1 = process.env.API_KEY1;
  const apiKey2 = process.env.API_KEY2;

  try {
    const [response1, response2] = await Promise.all([
      axios.get(apiUrl1, { params: { ...queryParams, apikey: apiKey1 } }),
      axios.get(apiUrl2, { params: { query: queryParams.s, api_key: apiKey2 } })
    ]);

    const moviesFromApi1 = response1.data.Search || [];
    const moviesFromApi2 = response2.data.results || [];

    const mappedMoviesFromApi1 = moviesFromApi1.map(movie => ({
      title: movie.Title,
      poster: movie.Poster,
      year: movie.Year,
      imdbID: movie.imdbID,
      source: 'OMDB'
    }));

    const mappedMoviesFromApi2 = moviesFromApi2.map(movie => ({
      title: movie.title,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300',
      year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
      imdbID: movie.id.toString(),
      source: 'TMDB'
    }));

    const combinedMovies = [
      ...mappedMoviesFromApi1,
      ...mappedMoviesFromApi2.filter(
        movie2 => !mappedMoviesFromApi1.some(movie1 => movie1.title === movie2.title)
      )
    ];
    return combinedMovies;
  } catch (error) {
    console.error('Error fetching data from APIs:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const fetchRecentMoviesFromAPI = async () => {
  try {
    let allMovies = [];
    let page = 1;

    while (allMovies.length < 24 && page <= 6) {
      const queryParams = {
        s: 'movie',
        type: 'movie',
        y: '2024',
        page
      };

      const movies = await fetchMoviesFromAPIs(queryParams);
      allMovies = allMovies.concat(movies);
      page++;
    }

    const movieDetailsPromises = allMovies.map((movie) => {
      if (movie.source === 'OMDB') {
        return axios.get(process.env.apiUrl1, {
          params: { apikey: process.env.API_KEY1, i: movie.imdbID }
        });
      } else if (movie.source === 'TMDB') {
        return axios.get(`${process.env.apiUrl2}3/movie/${movie.imdbID}`, {
          params: { api_key: process.env.API_KEY2 }
        });
      }
    });

    const movieDetailsResponses = await Promise.all(movieDetailsPromises);
    const detailedMovies = movieDetailsResponses.map((res) => res.data);
    detailedMovies.sort((a, b) => new Date(b.Released || b.release_date) - new Date(a.Released || a.release_date));
    const recentMovies = detailedMovies.slice(0, 15);
    const validatedMovies = recentMovies.map((movie) => {
      const releaseDate = new Date(movie.Released || movie.release_date);
      return {
        title: movie.Title || movie.title,
        imdbID: movie.imdbID || movie.id.toString(),
        releaseDate: isNaN(releaseDate.getTime()) ? null : releaseDate,
        poster: movie.Poster || `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
        cacheTimestamp: Date.now()
      };
    }).filter(movie => movie.releaseDate); 

    await Movie.deleteMany({});
    await Movie.insertMany(validatedMovies);
    return recentMovies;
  } catch (error) {
    logger.error('Error fetching recent movies from API:', error.message);
    throw new Error('Error fetching recent movies from API');
  }
};

const ensureRecentMoviesUpdated = async (req, res, next) => {
  try {
    console.log('task 2')

    const fifteenMinutesAgo = moment().subtract(15, 'minutes');
    const cachedMovies = await Movie.find({
      cacheTimestamp: { $gte: fifteenMinutesAgo }
    }).countDocuments();

    if (cachedMovies !== 12) {
      await fetchRecentMoviesFromAPI();
    }
  } catch (error) {
    console.error('Error updating recent movies:', error);
    return res.status(500).json({ message: 'Error updating recent movies', error: error.message });
  }
  next();
};

router.get('/recent', ensureRecentMoviesUpdated, async (req, res) => {
  try {
    console.log('task 1')
    const recentMovies = await Movie.find().sort({ releaseDate: -1 }).limit(12);
    res.json(recentMovies);
  } catch (error) {
    logger.error('Error fetching recent movies:', error);
    res.status(500).json({ message: 'Error fetching recent movies', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  const { query, type } = req.query;
  const queryParams = {
    s: query,
    type: type === 'actor' ? 'movie' : type
  };

  try {
    const movies = await fetchMoviesFromAPIs(queryParams);

    if (movies.length === 0) {
      return res.status(404).json({ error: 'No movies found' });
    }
    res.json(movies);
  } catch (error) {
    logger.error('Error fetching search results:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/movie/:id',authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [response1, response2] = await Promise.all([
      axios.get(`${process.env.apiUrl1}?apikey=${process.env.API_KEY1}&i=${id}`),
      axios.get(`${process.env.apiUrl2}3/movie/${id}`, {
        params: { api_key: process.env.API_KEY2 }
      })
    ]);

    const api1Data = response1.data;
    const api2Data = response2.data;

    const api1Normalized = {
      Title: api1Data.Title || api2Data.title,
      Year: api1Data.Year || api2Data.release_date.split('-')[0],
      Rated: api1Data.Rated || (api2Data.adult ? 'Rated' : 'Unrated'),
      Released: api1Data.Released || api2Data.release_date,
      Runtime: api1Data.Runtime || `${api2Data.runtime} min`,
      Genre: api1Data.Genre || api2Data.genres.map(genre => genre.name).join(', '),
      Director: api1Data.Director || (api2Data.production_companies.length > 0 ? api2Data.production_companies.map(company => company.name).join(', ') : 'N/A'),
      Writer: api1Data.Writer || 'N/A',
      Actors: api1Data.Actors || 'N/A',
      Plot: api1Data.Plot || api2Data.overview,
      Language: api1Data.Language || api2Data.spoken_languages.map(lang => lang.name).join(', '),
      Country: api1Data.Country || api2Data.production_countries.map(country => country.name).join(', '),
      Awards: api1Data.Awards || 'N/A',
      Metascore: api1Data.Metascore || 'N/A',
      imdbRating: api1Data.imdbRating || api2Data.vote_average,
      imdbVotes: api1Data.imdbVotes || api2Data.vote_count,
      imdbID: api1Data.imdbID || api2Data.imdb_id,
      Type: api1Data.Type || 'movie',
      DVD: api1Data.DVD || 'N/A',
      BoxOffice: api1Data.BoxOffice || 'N/A',
      Production: api1Data.Production || 'N/A',
      Website: api1Data.Website || api2Data.homepage,
      Poster: api1Data.Poster || api2Data.poster_path ? `https://image.tmdb.org/t/p/w300${api2Data.poster_path}` : 'N/A'
    };

    res.json(api1Normalized);
  } catch (error) {
    logger.error('Error fetching movie details:', error);
    res.status(500).send('Error fetching movie details');
  }
});

module.exports = router;
