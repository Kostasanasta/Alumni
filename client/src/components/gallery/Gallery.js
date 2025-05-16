import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import AlertContext from '../../context/alert/AlertContext';
import './Gallery.css';

// Mock data is commented out, now using API data
// const mockAlbums = [ ... ]

const Gallery = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/albums');
        setAlbums(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching albums:', err.message);
        setIsLoading(false);
        setAlert('Failed to load photo albums', 'danger');
      }
    };

    fetchAlbums();
  }, [setAlert]);

  const openAlbum = (albumId) => {
    const album = albums.find(a => a._id === albumId);
    setSelectedAlbum(album);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalOpen(true);
    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
  };

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
    // Remove event listener when modal is closed
    document.removeEventListener('keydown', handleKeyDown);
  };

  const navigatePhoto = useCallback((direction) => {
    if (!selectedAlbum || !selectedPhoto) return;
    
    const currentIndex = selectedAlbum.photos.findIndex(photo => photo._id === selectedPhoto._id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % selectedAlbum.photos.length;
    } else {
      newIndex = (currentIndex - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length;
    }
    
    setSelectedPhoto(selectedAlbum.photos[newIndex]);
  }, [selectedAlbum, selectedPhoto]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      navigatePhoto('next');
    } else if (e.key === 'ArrowLeft') {
      navigatePhoto('prev');
    } else if (e.key === 'Escape') {
      closePhotoModal();
    }
  }, [navigatePhoto, closePhotoModal]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatMonthDay = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('en-US', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Photo Gallery</h1>
      
      {selectedAlbum ? (
        <div className="album-view">
          <div className="album-header">
            <button className="btn" onClick={closeAlbum}>
              <i className="fas fa-arrow-left"></i> Back to Albums
            </button>
            <h2>{selectedAlbum.title}</h2>
            <p className="lead">
              <i className="fas fa-calendar-alt"></i> {formatDate(selectedAlbum.createdAt)}
            </p>
            <p>{selectedAlbum.description}</p>
          </div>
          
          <div className="photos-grid">
            {selectedAlbum.photos.map(photo => (
              <div 
                key={photo._id} 
                className="photo-card" 
                onClick={() => openPhotoModal(photo)}
              >
                <img src={photo.url} alt={photo.caption || 'Photo'} />
                {photo.caption && <div className="photo-caption">{photo.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map(album => (
            <div 
              key={album._id}
              className="album-card" 
              onClick={() => openAlbum(album._id)}
            >
              <div className="album-thumbnail">
                <img src={album.coverImage} alt={album.title} />
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <p>
                    <i className="fas fa-calendar-alt"></i> {formatDate(album.createdAt)}
                  </p>
                  <p>
                    <i className="fas fa-images"></i> {album.photos.length} Photos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {photoModalOpen && selectedPhoto && (
        <div className="photo-modal-overlay" onClick={closePhotoModal}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closePhotoModal}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-nav prev" onClick={() => navigatePhoto('prev')}>
              <i className="fas fa-chevron-left"></i>
            </div>
            
            <div className="modal-photo">
              <img src={selectedPhoto.url} alt={selectedPhoto.caption || 'Photo'} />
              {selectedPhoto.caption && (
                <div className="modal-caption">{selectedPhoto.caption}</div>
              )}
              {selectedPhoto.uploadedAt && (
                <div className="modal-date">
                  <i className="fas fa-calendar-alt"></i> {formatDate(selectedPhoto.uploadedAt)}
                </div>
              )}
            </div>
            
            <div className="modal-nav next" onClick={() => navigatePhoto('next')}>
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 