const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const path = require('path');

// @route   POST api/uploads
// @desc    Upload an image
// @access  Private (Admin only)
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Create file path for client
    const filePath = `/uploads/${req.file.filename}`;
    
    res.json({ 
      filePath,
      success: true 
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

module.exports = router; 