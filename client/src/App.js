import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieList from './components/MovieList';
import SearchBar from './components/SearchBar';
import MovieDetails from './components/MovieDetails';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';

const App = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Main />} />
          <Route path="/movie/:id" element={<PrivateRoute element={<MovieDetails />} />} />
        </Routes>
      </Router>
    </div>
  );
};

const Main = () => (
  <div>
    <SearchBar />
    <MovieList />
  </div>
);

const Root = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default Root;
