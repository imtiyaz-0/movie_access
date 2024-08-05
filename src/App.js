import React, { useState } from 'react';
import MovieList from './components/MovieList';
import SearchBar from './components/SearchBar';

const App = () => {
  return (
    <div>
      <SearchBar />
      <MovieList />
    </div>
  );
};

export default App;

