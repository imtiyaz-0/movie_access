import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams , useNavigate } from 'react-router-dom';
import MovieList from './components/MovieList';
import SearchBar from './components/SearchBar';
import MovieDetails from './components/MovieDetails';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordReset from './components/PasswordReset';
import NotFound from './components/NotFound';
import ViewProfile from './components/Profile'
const App = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`app ${theme}`}>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/request-reset" element={<PasswordResetRequest />} />
          <Route path="/reset/:token" element={<PasswordReset />} />
          <Route path ="/Profile" element={<ViewProfile/>}/>
          <Route path="*" element={<NotFound />} /> 
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

const PrivateRouteWrapper = () => {
  const { id } = useParams();
  return <PrivateRoute element={<MovieDetails />} movieId={id} />;
};

const Root = () => (
  <ThemeProvider>

    <App />

  </ThemeProvider>
);

export default Root;
