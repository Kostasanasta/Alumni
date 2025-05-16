import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import './PhotoManagement.css';

// Mock data is commented out, now using API data
// const mockAlbums = [ ... ]

const PhotoManagement = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { user, loading } = authContext;
  const { setAlert } = alertContext;

  const [albums, setAlbums] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    coverImage: ''
  });
  const [photoForm, setPhotoForm] = useState({
    url: '',
    caption: ''
  });
  const [showAddAlbumForm, setShowAddAlbumForm] = useState(false);
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'carousel'

  useEffect(() => {
    // Fetch albums from the API
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/albums');
        setAlbums(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching albums:', err.message);
        setIsLoading(false);
        setAlert('Failed to load albums', 'danger');
      }
    };

    fetchAlbums();
  }, [setAlert]);

  const { title, description, coverImage } = albumForm;
  const { url, caption } = photoForm;

  const onAlbumFormChange = e => {
    setAlbumForm({ ...albumForm, [e.target.name]: e.target.value });
  };

  const onPhotoFormChange = e => {
    setPhotoForm({ ...photoForm, [e.target.name]: e.target.value });
  };

  const handleAddAlbum = async e => {
    e.preventDefault();
    if (!title) {
      setAlert('Please fill in the album title', 'danger');
      return;
    }

    try {
      const newAlbumData = {
        title,
        description,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1508896694512-1eade558679c'
      };

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/albums', newAlbumData, config);
      
      // Add the new album to the current list
      setAlbums([res.data, ...albums]);
      setAlert('Album added successfully', 'success');
      setAlbumForm({
        title: '',
        description: '',
        coverImage: ''
      });
      setShowAddAlbumForm(false);
    } catch (err) {
      console.error('Error adding album:', err.response?.data?.msg || err.message);
      setAlert(err.response?.data?.msg || 'Error adding album', 'danger');
    }
  };

  const handleAddPhoto = async e => {
    e.preventDefault();
    if (!url) {
      setAlert('Please provide a photo URL', 'danger');
      return;
    }

    if (!currentAlbum) {
      setAlert('Please select an album first', 'danger');
      return;
    }

    try {
      const newPhotoData = {
        url,
        caption
      };

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(`/api/albums/${currentAlbum._id}/photos`, newPhotoData, config);
      
      // Update the current album with the updated photos list
      const updatedAlbum = {
        ...currentAlbum,
        photos: res.data
      };

      // Update the album in the albums list
      setAlbums(albums.map(album => 
        album._id === currentAlbum._id ? updatedAlbum : album
      ));
      
      setCurrentAlbum(updatedAlbum);
      setAlert('Photo added successfully', 'success');
      setPhotoForm({
        url: '',
        caption: ''
      });
      setShowAddPhotoForm(false);
    } catch (err) {
      console.error('Error adding photo:', err.response?.data?.msg || err.message);
      setAlert(err.response?.data?.msg || 'Error adding photo', 'danger');
    }
  };

  const handleDeleteAlbum = async albumId => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await axios.delete(`/api/albums/${albumId}`);
        
        // Remove the album from the albums list
        setAlbums(albums.filter(album => album._id !== albumId));
        
        if (currentAlbum && currentAlbum._id === albumId) {
          setCurrentAlbum(null);
        }
        
        setAlert('Album deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting album:', err.response?.data?.msg || err.message);
        setAlert(err.response?.data?.msg || 'Error deleting album', 'danger');
      }
    }
  };

  const handleDeletePhoto = async (albumId, photoId) => {
    if (!currentAlbum) return;
    
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const res = await axios.delete(`/api/albums/${albumId}/photos/${photoId}`);
        
        // Update the current album with the updated photos list
        const updatedAlbum = {
          ...currentAlbum,
          photos: res.data
        };
        
        // Update the album in the albums list
        setAlbums(albums.map(album => 
          album._id === albumId ? updatedAlbum : album
        ));
        
        setCurrentAlbum(updatedAlbum);
        setAlert('Photo deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting photo:', err.response?.data?.msg || err.message);
        setAlert(err.response?.data?.msg || 'Error deleting photo', 'danger');
      }
    }
  };

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading || !user || isLoading) {
    return <Spinner />;
  }

  return (
    <div className="photo-management-container">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">Photo Album Management</h1>
          <div className="header-actions">
            <Link to="/dashboard" className="btn-back">
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </Link>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddAlbumForm(!showAddAlbumForm)}
            >
              <i className="fas fa-plus"></i> {showAddAlbumForm ? 'Hide Form' : 'New Album'}
            </button>
          </div>
        </div>
      </header>

      {showAddAlbumForm && (
        <div className="form-container bg-light">
          <h2 className="form-title">Create New Album</h2>
          <form onSubmit={handleAddAlbum} className="album-form">
            <div className="form-group">
              <label htmlFor="title">Album Title*</label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onAlbumFormChange}
                placeholder="Enter album title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                value={description}
                onChange={onAlbumFormChange}
                placeholder="Enter album description"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="coverImage">Cover Image URL</label>
              <input
                type="url"
                name="coverImage"
                value={coverImage}
                onChange={onAlbumFormChange}
                placeholder="Enter cover image URL"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-save"></i> Create Album
              </button>
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={() => {
                  setAlbumForm({
                    title: '',
                    description: '',
                    coverImage: ''
                  });
                  setShowAddAlbumForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="albums-container">
        <div className="albums-list">
          <h2 className="section-title">Albums</h2>
          {albums.length === 0 ? (
            <div className="empty-message">
              <p>No albums found. Create your first album to get started.</p>
            </div>
          ) : (
            <div className="albums-grid">
              {albums.map(album => (
                <div 
                  key={album._id} 
                  className={`album-card ${currentAlbum && currentAlbum._id === album._id ? 'selected' : ''}`}
                  onClick={() => setCurrentAlbum(album)}
                >
                  <div className="album-thumbnail">
                    <img src={album.coverImage} alt={album.title} />
                    <span className="photo-count">
                      <i className="fas fa-images"></i> {album.photos.length}
                    </span>
                  </div>
                  <div className="album-info">
                    <h3>{album.title}</h3>
                    <p className="album-date">
                      <i className="fas fa-calendar-alt"></i> {formatDate(album.createdAt)}
                    </p>
                    <button 
                      className="btn-delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album._id);
                      }}
                      title="Delete Album"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentAlbum && (
          <div className="album-content">
            <div className="album-header">
              <h2>{currentAlbum.title}</h2>
              <div className="album-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowAddPhotoForm(!showAddPhotoForm)}
                >
                  <i className="fas fa-plus"></i> {showAddPhotoForm ? 'Hide Form' : 'Add Photo'}
                </button>
                <div className="view-toggle">
                  <button 
                    className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`} 
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button 
                    className={`btn-toggle ${viewMode === 'carousel' ? 'active' : ''}`} 
                    onClick={() => setViewMode('carousel')}
                    title="Carousel View"
                  >
                    <i className="fas fa-film"></i>
                  </button>
                </div>
              </div>
            </div>

            {showAddPhotoForm && (
              <div className="form-container bg-light">
                <h3 className="form-title">Add New Photo</h3>
                <form onSubmit={handleAddPhoto} className="photo-form">
                  <div className="form-group">
                    <label htmlFor="url">Photo URL*</label>
                    <input
                      type="url"
                      name="url"
                      value={url}
                      onChange={onPhotoFormChange}
                      placeholder="Enter photo URL"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="caption">Caption</label>
                    <input
                      type="text"
                      name="caption"
                      value={caption}
                      onChange={onPhotoFormChange}
                      placeholder="Enter photo caption"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      <i className="fas fa-save"></i> Add Photo
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-light" 
                      onClick={() => {
                        setPhotoForm({
                          url: '',
                          caption: ''
                        });
                        setShowAddPhotoForm(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={`photos-container ${viewMode}`}>
              {currentAlbum.photos.length === 0 ? (
                <div className="empty-message">
                  <p>No photos in this album yet. Add your first photo to get started.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="photos-grid">
                  {currentAlbum.photos.map(photo => (
                    <div key={photo._id} className="photo-item">
                      <div className="photo-image">
                        <img src={photo.url} alt={photo.caption || 'Photo'} />
                        <div className="photo-overlay">
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeletePhoto(currentAlbum._id, photo._id)}
                            title="Delete Photo"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                      {photo.caption && <div className="photo-caption">{photo.caption}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="photos-carousel">
                  {/* Carousel view implementation */}
                  <div className="carousel-container">
                    {currentAlbum.photos.map((photo, index) => (
                      <div key={photo._id} className="carousel-item">
                        <img src={photo.url} alt={photo.caption || `Photo ${index + 1}`} />
                        <div className="carousel-caption">
                          <h3>{photo.caption || `Photo ${index + 1}`}</h3>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeletePhoto(currentAlbum._id, photo._id)}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoManagement; 