import React, { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (option) => {
    setDropdownOpen(dropdownOpen === option ? null : option);
  };
  // const token = Cookies.get('token');
  
  const handleLoginClick = () => {
    navigate('/login');
  };
  // const logout = async () => {
  //   try {
  //     await axios.post('/api/auth/logout'); // Make sure you implement this route in your backend
  //     navigate('/');
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }
  // };/

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };
  const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderBottom: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
      color: theme === 'light' ? '#000' : '#fff',
    },
    themeToggle: {
      marginRight: '20px',
      backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    navbar: {
      display: 'flex',
      alignItems: 'center',
    },
    dropdown: {
      position: 'relative',
      marginRight: '5px',
      marginLeft:'10px'
    },
    dropdownToggle: {
     marginRight:'100px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '10px',
      color: theme === 'light' ? '#000' : '#fff',
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: '0',
      backgroundColor: theme === 'light' ? '#fff' : '#555',
      border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
      boxShadow: `0 4px 8px rgba(0,0,0,0.1)`,
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      width: '200px',
      zIndex: '1000',
    },
    dropdownMenuItem: {
      textDecoration: 'none',
      color: theme === 'light' ? '#333' : '#eee',
      padding: '8px 0',
    },

    dropdownMenuItemHover: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#666',
    },
    arrow: {
      marginLeft: '5px',
    },
    loginButton: {
      backgroundColor: theme === 'light' ? '#007bff' : '#0056b3',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    
  };

  return (
    <header style={styles.header}>
      <button style={styles.themeToggle} onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      
      <nav style={styles.navbar}>
        <div style={styles.dropdown} >
          <button
            style={styles.dropdownToggle}
            onClick={() => handleDropdownToggle('movies')}
          >
            Movies <span style={styles.arrow}>&#9662;</span>
          </button>
          {dropdownOpen === 'movies' && (
          <div style={styles.dropdownMenu} ref={dropdownRef}>
          <Link to="/" style={styles.dropdownMenuItem}>Home</Link>
          <Link to="/top-rated" style={styles.dropdownMenuItem}>Top Rated</Link>
          <Link to="/genres" style={styles.dropdownMenuItem}>Genres</Link>
          <Link to="/more" style={{ ...styles.dropdownMenuItem, ...styles.dropdownMenuItemHover }}>
              Click here for more details
          </Link>
      </div>
          )}
        </div>
{isAuthenticated && 
        <div style={styles.dropdown}>
          <button
            style={styles.dropdownToggle}
            onClick={() => handleDropdownToggle('profile')}
          >
            Profile <span style={styles.arrow}>&#9662;</span>
          </button>
          {dropdownOpen === 'profile' && (
             <div style={styles.dropdownMenu} ref={dropdownRef}>
             <Link to="/profile" style={styles.dropdownMenuItem}>View Profile</Link>
             <Link to="/settings" style={styles.dropdownMenuItem}>Settings</Link>
             <button onClick={handleLogoutClick} style={styles.dropdownMenuItem}>Logout</button>
         </div>
          )}
        </div>}
{!isAuthenticated && 
        <button onClick={handleLoginClick} style={styles.loginButton}>Login</button>}
      </nav>
    </header>
  );
};

export default Header;
