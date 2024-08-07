import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:${process.env.REACT_APP_PORT}/api/auth/register`, { username, password });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const moveToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.formContainer(theme)}>
        <h2 style={styles.header(theme)}>Register</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input(theme)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input(theme)}
          />
          <button type="submit" style={styles.button(theme)}>Register</button>
        </form>
        <button type="button" onClick={moveToLogin} style={styles.registerButton(theme)}>
          Already registered?
        </button>
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
    width: '100%',
    maxWidth: '400px',
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
};

export default Register;
