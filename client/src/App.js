import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieList from './components/MovieList';
import SearchBar from './components/SearchBar';
import MovieDetails from './components/MovieDetails';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
};

const Main = () => (
  <div>
    <SearchBar />
    <MovieList />
  </div>
);
export default App;
