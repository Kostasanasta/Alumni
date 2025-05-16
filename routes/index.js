const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./api/auth');
const profilesRoutes = require('./api/profiles');
const schoolsRoutes = require('./api/schools');
const eventsRoutes = require('./api/events');
const albumsRoutes = require('./api/albums');
const uploadsRoutes = require('./api/uploads');

// Define routes
router.use('/auth', authRoutes);
router.use('/profiles', profilesRoutes);
router.use('/schools', schoolsRoutes);
router.use('/events', eventsRoutes);
router.use('/albums', albumsRoutes);
router.use('/uploads', uploadsRoutes);

module.exports = router; 