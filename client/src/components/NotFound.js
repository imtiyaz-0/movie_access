import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404</h1>
      <p style={styles.message}>Oops! The page you are looking for does not exist.</p>
      <p>
        <Link to="/" style={styles.link}>Go back to the homepage</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    color: '#333',
    textAlign: 'center'
  },
  heading: {
    fontSize: '4rem',
    color: '#e74c3c'
  },
  message: {
    fontSize: '1.2rem',
    margin: '20px 0'
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default NotFound;
