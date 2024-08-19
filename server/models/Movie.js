const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  imdbID: String,
  releaseDate: Date,
  poster: String,
  cacheTimestamp: { type: Date, default: Date.now }
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;

