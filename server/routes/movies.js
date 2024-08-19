const express = require('express');
const axios = require('axios');
const Movie = require('../models/Movie');
const router = express.Router();
const logger = require('../logger');

const fetchRecentMoviesFromAPI = async () => {
  try {
    let allMovies = [];
    let page = 1;

    while (allMovies.length < 24 && page <= 6) {
      try {
        const response = await axios.get(process.env.apiUrl, {
          params: {
            apikey: process.env.API_KEY,
            s: 'movie',
            type: 'movie',
            y: '2024',
            page
          }
        });

        if (response.data.Response === "False") {
          logger.error('API Error:', response.data.Error);
          throw new Error(response.data.Error);
        }

        allMovies = allMovies.concat(response.data.Search);
        page++;
      } catch (apiError) {
        logger.error('Error making API request:', apiError.message);
        throw apiError;
      }
    }

    // logger.info('All movies fetched:', allMovies);

    const movieDetailsPromises = allMovies.map(movie =>
      axios.get(process.env.apiUrl, { params: { apikey: process.env.API_KEY, i: movie.imdbID } })
    );

    try {
      const movieDetailsResponses = await Promise.all(movieDetailsPromises);
      const detailedMovies = movieDetailsResponses.map(res => res.data);

      // logger.info('Movie details fetched:', detailedMovies);

      detailedMovies.sort((a, b) => new Date(b.Released) - new Date(a.Released));
      const recentMovies = detailedMovies.slice(0, 12);

      // logger.info('Recent movies determined:', recentMovies);

      await Movie.deleteMany({});
      await Movie.insertMany(recentMovies.map(movie => ({
        title: movie.Title,
        imdbID: movie.imdbID,
        releaseDate: new Date(movie.Released),
        poster: movie.Poster,
        cacheTimestamp: Date.now()
      })));

      return recentMovies;
    } catch (processingError) {
      logger.error('Error processing movie details:', processingError.message);
      throw processingError;
    }
  } catch (error) {
    logger.error('Error fetching recent movies from API:', error.message);
    throw new Error('Error fetching recent movies from API');
  }
};


const ensureRecentMoviesUpdated = async (req, res, next) => {
  try {
    const cachedMovies = await Movie.find().sort({ cacheTimestamp: -1 }).limit(1);
    const now = Date.now();

    if (cachedMovies.length === 0 || (now - cachedMovies[0].cacheTimestamp) > (parseInt(process.env.CACHE_DURATION, 10) || 10000)) {
      // logger.info('Cache is outdated or empty, fetching new data...');
      await fetchRecentMoviesFromAPI();
    } else {
    //  logger.info('Cache is valid, using existing data...');
    }
  } catch (error) {
    logger.error('Error updating recent movies:', error);
    return res.status(500).json({ message: 'Error updating recent movies', error: error.message });
  }
  next();
};


/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: The movie managing API
 */

/**
 * @swagger
 * /api/movies/recent:
 *   get:
 *     summary: Get recent movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of recent movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   imdbID:
 *                     type: string
 *                   releaseDate:
 *                     type: string
 *                     format: date
 *                   poster:
 *                     type: string
 */
router.get('/recent', ensureRecentMoviesUpdated, async (req, res) => {
  try {
    const recentMovies = await Movie.find().sort({ releaseDate: -1 }).limit(12);
    res.json(recentMovies);
  } catch (error) {
    logger.error('Error fetching recent movies:', error);
    res.status(500).json({ message: 'Error fetching recent movies', error: error.message });
  }
});


/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search movies by query
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series, episode, actor]
 *         required: false
 *         description: The type of search (default is movie)
 *     responses:
 *       200:
 *         description: List of search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   imdbID:
 *                     type: string
 *                   poster:
 *                     type: string
 *       404:
 *         description: No movies found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/movies/movie/{id}:
 *   get:
 *     summary: Get movie details by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 year:
 *                   type: string
 *                 rated:
 *                   type: string
 *                 released:
 *                   type: string
 *                 runtime:
 *                   type: string
 *                 genre:
 *                   type: string
 *                 director:
 *                   type: string
 *                 writer:
 *                   type: string
 *                 actors:
 *                   type: string
 *                 plot:
 *                   type: string
 *                 language:
 *                   type: string
 *                 country:
 *                   type: string
 *                 awards:
 *                   type: string
 *                 poster:
 *                   type: string
 *                 ratings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Source:
 *                         type: string
 *                       Value:
 *                         type: string
 *                 metascore:
 *                   type: string
 *                 imdbRating:
 *                   type: string
 *                 imdbVotes:
 *                   type: string
 *                 imdbID:
 *                   type: string
 *                 type:
 *                   type: string
 *                 dvd:
 *                   type: string
 *                 boxOffice:
 *                   type: string
 *                 production:
 *                   type: string
 *                 website:
 *                   type: string
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Server error
 */
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
