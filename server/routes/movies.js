const express = require('express');
const axios = require('axios');
const Movie = require('../models/Movie');
const router = express.Router();
const logger = require('../logger');
const fetchRecentMoviesFromAPI = async () => {
  try {
    let allMovies = [];
    let page = 1;

    while (allMovies.length < 20 && page <= 5) {
      const response = await axios.get(process.env.API_URL, {
        params: {
          apikey: process.env.API_KEY,
          s: 'movie',
          type: 'movie',
          y: '2024',
          page
        }
      });

      if (response.data.Response === "False") {
        throw new Error(response.data.Error);
      }

      allMovies = allMovies.concat(response.data.Search);
      page++;
    }

    const movieDetailsPromises = allMovies.map(movie =>
      axios.get(process.env.API_URL, { params: { apikey: process.env.API_KEY, i: movie.imdbID } })
    );
    
    const movieDetailsResponses = await Promise.all(movieDetailsPromises);
    const detailedMovies = movieDetailsResponses.map(res => res.data);
    
    detailedMovies.sort((a, b) => new Date(b.Released) - new Date(a.Released));
    const recentMovies = detailedMovies.slice(0, 10);

    await Movie.deleteMany({});
    await Movie.insertMany(recentMovies.map(movie => ({
      title: movie.Title,
      imdbID: movie.imdbID,
      releaseDate: new Date(movie.Released),
      poster: movie.Poster,
      cacheTimestamp: Date.now()
    })));

    return recentMovies;
  } catch (error) {
    logger.error('Error fetching movies from OMDb API:', error);
    throw new Error('Error fetching recent movies from API');
  }
};

const ensureRecentMoviesUpdated = async (req, res, next) => {
  try {
    const cachedMovies = await Movie.find();
    const now = Date.now();

    if (cachedMovies.length === 0 || (now - cachedMovies[0].cacheTimestamp.getTime()) > process.env.CACHE_DURATION) {
      await fetchRecentMoviesFromAPI();
    }
  } catch (error) {
    logger.error('Error updating recent movies:', error);
    return res.status(500).json({ message: 'Error updating recent movies', error: error.message });
  }
  next();
};

router.get('/recent', ensureRecentMoviesUpdated, async (req, res) => {
  try {
    const recentMovies = await Movie.find().sort({ releaseDate: -1 }).limit(10);
    res.json(recentMovies);
  } catch (error) {
    logger.error('Error fetching recent movies:', error);
    res.status(500).json({ message: 'Error fetching recent movies', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  const { query, type } = req.query;
  const apiUrl = `http://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=${query}&type=${type === 'actor' ? 'movie' : type}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data.Response === "False") {
      return res.status(404).json({ error: response.data.Error });
    }
    res.json(response.data.Search);
  } catch (error) {
    logger.error('Error fetching search results:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.API_KEY}&i=${id}`);
    if (response.data.Response === "False") {
      return res.status(404).json({ error: response.data.Error });
    }
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching movie details:', error);
    res.status(500).send('Error fetching movie details');
  }
});


module.exports = router;
