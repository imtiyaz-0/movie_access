import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [fileInputValue, setFileInputValue] = useState(''); 
  const navigate = useNavigate();
  useEffect(() => {
   
    if (isAuthenticated) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/profile`, { withCredentials: true });
          setUser(response.data);
          
        } catch (error) {
          if(error.response.status===401){
            navigate('/');
          }
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handlePhotoChange = (e) => {
    setNewPhoto(e.target.files[0]);
    setFileInputValue(e.target.value);
  };


  const handlePhotoUpload = async () => {
    if (!newPhoto) return;
    const formData = new FormData();
    formData.append('photo', newPhoto);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profile/profile/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setUser((prev) => ({ ...prev, photoUrl: response.data.photoUrl }));
      setNewPhoto(null);
      setFileInputValue('');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  if (!user) return <div style={styles.loading}>You are not Loged IN..</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Profile</h1>
      <div style={styles.content}>
        <img 
          src={user.photoUrl } 
           
          style={styles.photo} 
        />
        <div style={styles.details}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div style={styles.upload}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            value={fileInputValue} 
            style={styles.fileInput}
          />
          <button 
            onClick={handlePhotoUpload} 
            style={styles.uploadButton}
          >
            Upload Photo
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  photo: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '3px solid #ddd',
    objectFit: 'cover',
    marginBottom: '20px',
  },
  details: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  upload: {
    textAlign: 'center',
  },
  fileInput: {
    marginBottom: '10px',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#555',
  },
};

export default ViewProfile;
