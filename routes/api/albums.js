const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Album = require('../../models/Album');
const User = require('../../models/User');
const fs = require('fs');
const path = require('path');

// Mock data for albums when database is unavailable
let mockAlbums;
try {
  // Try to load mock data if it exists
  const mockDataPath = path.join(__dirname, '../../mock/albumData.js');
  if (fs.existsSync(mockDataPath)) {
    mockAlbums = require('../../mock/albumData');
    console.log('Using mock albums data');
  }
} catch (err) {
  console.error('Error loading mock albums data:', err.message);
}

// @route   GET api/albums
// @desc    Get all photo albums
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Try to get albums from database
    const albums = await Album.find().sort({ createdAt: -1 });
    res.json(albums);
  } catch (err) {
    console.error(err.message);
    
    // If database error and mock data is available, return mock data
    if (mockAlbums) {
      return res.json(mockAlbums);
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET api/albums/:id
// @desc    Get album by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    res.json(album);
  } catch (err) {
    console.error(err.message);
    
    // If database error and mock data is available, try to find the album in mock data
    if (mockAlbums) {
      const album = mockAlbums.find(a => a._id.toString() === req.params.id);
      
      if (album) {
        return res.json(album);
      }
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Album not found' });
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/albums
// @desc    Create a new photo album
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(401).json({ msg: 'Not authorized to create photo albums' });
      }
      
      const {
        title,
        description,
        coverImage
      } = req.body;
      
      // Build album object
      const newAlbum = new Album({
        title,
        description,
        coverImage,
        createdBy: req.user.id,
        photos: []
      });
      
      const album = await newAlbum.save();
      
      res.json(album);
    } catch (err) {
      console.error(err.message);
      
      // If database error and using mock data, create a mock album
      if (mockAlbums) {
        const mongoose = require('mongoose');
        const {
          title,
          description,
          coverImage
        } = req.body;
        
        const newAlbum = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description: description || '',
          coverImage: coverImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
          photos: [],
          createdBy: req.user.id,
          createdAt: new Date()
        };
        
        mockAlbums.push(newAlbum);
        
        return res.json(newAlbum);
      }
      
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/albums/:id
// @desc    Update a photo album
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update photo albums' });
    }
    
    let album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    const {
      title,
      description,
      coverImage
    } = req.body;
    
    // Build album object
    const albumFields = {};
    if (title) albumFields.title = title;
    if (description !== undefined) albumFields.description = description;
    if (coverImage) albumFields.coverImage = coverImage;
    
    album = await Album.findByIdAndUpdate(
      req.params.id,
      { $set: albumFields },
      { new: true }
    );
    
    res.json(album);
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, update the mock album
    if (mockAlbums) {
      const albumIndex = mockAlbums.findIndex(a => a._id.toString() === req.params.id);
      
      if (albumIndex !== -1) {
        const {
          title,
          description,
          coverImage
        } = req.body;
        
        // Update fields if provided
        if (title) mockAlbums[albumIndex].title = title;
        if (description !== undefined) mockAlbums[albumIndex].description = description;
        if (coverImage) mockAlbums[albumIndex].coverImage = coverImage;
        
        return res.json(mockAlbums[albumIndex]);
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/albums/:id
// @desc    Delete a photo album
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete photo albums' });
    }
    
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    await album.deleteOne();
    
    res.json({ msg: 'Album removed' });
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, delete the mock album
    if (mockAlbums) {
      const albumIndex = mockAlbums.findIndex(a => a._id.toString() === req.params.id);
      
      if (albumIndex !== -1) {
        mockAlbums.splice(albumIndex, 1);
        return res.json({ msg: 'Album removed' });
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/albums/:id/photos
// @desc    Add a photo to an album
// @access  Private (Admin only)
router.post(
  '/:id/photos',
  [
    auth,
    [
      check('url', 'Photo URL is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(401).json({ msg: 'Not authorized to add photos to albums' });
      }
      
      const album = await Album.findById(req.params.id);
      
      if (!album) {
        return res.status(404).json({ msg: 'Album not found' });
      }
      
      const {
        url,
        caption
      } = req.body;
      
      const newPhoto = {
        url,
        caption,
        uploadedAt: Date.now()
      };
      
      album.photos.unshift(newPhoto);
      
      await album.save();
      
      res.json(album.photos);
    } catch (err) {
      console.error(err.message);
      
      // If database error and using mock data, add a photo to the mock album
      if (mockAlbums) {
        const albumIndex = mockAlbums.findIndex(a => a._id.toString() === req.params.id);
        
        if (albumIndex !== -1) {
          const {
            url,
            caption
          } = req.body;
          
          const mongoose = require('mongoose');
          const newPhoto = {
            _id: new mongoose.Types.ObjectId(),
            url,
            caption,
            uploadedAt: Date.now()
          };
          
          mockAlbums[albumIndex].photos.unshift(newPhoto);
          
          return res.json(mockAlbums[albumIndex].photos);
        }
      }
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Album not found' });
      }
      
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/albums/:id/photos/:photo_id
// @desc    Delete a photo from an album
// @access  Private (Admin only)
router.delete('/:id/photos/:photo_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete photos from albums' });
    }
    
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    // Find the photo to remove
    const photoIndex = album.photos.findIndex(
      photo => photo._id.toString() === req.params.photo_id
    );
    
    if (photoIndex === -1) {
      return res.status(404).json({ msg: 'Photo not found' });
    }
    
    // Remove the photo
    album.photos.splice(photoIndex, 1);
    
    await album.save();
    
    res.json(album.photos);
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, delete a photo from the mock album
    if (mockAlbums) {
      const albumIndex = mockAlbums.findIndex(a => a._id.toString() === req.params.id);
      
      if (albumIndex !== -1) {
        // Find the photo to remove
        const photoIndex = mockAlbums[albumIndex].photos.findIndex(
          photo => photo._id.toString() === req.params.photo_id
        );
        
        if (photoIndex === -1) {
          return res.status(404).json({ msg: 'Photo not found' });
        }
        
        // Remove the photo
        mockAlbums[albumIndex].photos.splice(photoIndex, 1);
        
        return res.json(mockAlbums[albumIndex].photos);
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Album not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router; 