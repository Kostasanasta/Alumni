const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  coverImage: {
    type: String
  },
  photos: [PhotoSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Album', AlbumSchema); 