import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();
  const location = useLocation();
  const [forPass , setForPass] = useState(false);
  const { theme } = useContext(ThemeContext);
  const {  setIsAuthenticated } = useContext(AuthContext);

  const validateForm = () => {
    if (!username || !password) {
      setError('Username and Password are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    if (!validateForm()) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { username, password }, { withCredentials: true });
      setIsAuthenticated(true);  
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Incorrect username or password');
        setForPass(true);
      } else {
        setError('Login failed. Please try again later.');
      }
      console.error('Login error:', error);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', response.data.token);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (error) {
      setError('Google login error')
      console.error('Google login error:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const moveToRegister = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  const backToMovieList = () => {
    navigate('/', { replace: true });
  };

  const handleForgotPassword = () => {
    navigate('/request-reset', { state: { from: location.state?.from } });
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.formContainer(theme)}>
        <h2 style={styles.header(theme)}>Login</h2>
        {error && <div style={styles.error(theme)}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}        
            style={styles.input(theme)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input(theme)}
          />
          <button type="submit" style={styles.button(theme)}>Login</button>
        </form>
        <div style={styles.googleButtonContainer}>
           <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => console.log('Login Failed')}
            render={({ onClick, disabled }) => (
              <button onClick={onClick} disabled={disabled} style={styles.googleButton(theme)}>
                Login with Google
              </button>
            )}
          />
        </div>
        <button type="button" onClick={moveToRegister} style={styles.registerButton(theme)}>
          Register!
        </button>
        <button type="button" onClick={backToMovieList} style={styles.backButton(theme)}>
          Back to Movie List
        </button>
        {forPass && <button type="button" onClick={handleForgotPassword} style={styles.forgotPasswordButton(theme)}>
          Forgot Password?
        </button>}
      </div>
    </div>
  );
};

const styles = {
  container: (theme) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: theme === 'dark' ? '#333' : '#f4f4f4',
    transition: 'background-color 0.3s',
  }),
  formContainer: (theme) => ({
    width: '400px',
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#444' : '#fff',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 0 10px rgba(0, 0, 0, 0.5)' : '0 0 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
  }),
  header: (theme) => ({
    marginBottom: '20px',
    fontSize: '2rem',
    color: theme === 'dark' ? '#fff' : '#333',
  }),
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: (theme) => ({
    padding: '10px',
    marginBottom: '10px',
    border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: theme === 'dark' ? '#555' : '#fff',
    color: theme === 'dark' ? '#ddd' : '#333',
  }),
  button: (theme) => ({
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }),
  googleButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },
  googleButton: (theme) => ({
    backgroundColor: '#db4437',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '10px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#c33c29',
    },
    width: '100%',
    textAlign: 'center',
  }),
  registerButton: (theme) => ({
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }),
  backButton: (theme) => ({
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }),
  forgotPasswordButton: (theme) => ({
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }),
  error: (theme) => ({
    color: 'red',
    marginBottom: '10px',
    fontSize: '0.9rem',
  }),
};

export default Login;
