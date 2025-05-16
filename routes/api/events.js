const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Event = require('../../models/Event');
const User = require('../../models/User');
const fs = require('fs');
const path = require('path');

// Mock data for events when database is unavailable
let mockEvents;
try {
  // Try to load mock data if it exists
  const mockDataPath = path.join(__dirname, '../../mock/eventData.js');
  if (fs.existsSync(mockDataPath)) {
    mockEvents = require('../../mock/eventData');
    console.log('Using mock events data');
  }
} catch (err) {
  console.error('Error loading mock events data:', err.message);
}

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Try to get events from database
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    
    // If database error and mock data is available, return mock data
    if (mockEvents) {
      return res.json(mockEvents);
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    
    // If database error and mock data is available, try to find the event in mock data
    if (mockEvents) {
      const event = mockEvents.find(e => e._id.toString() === req.params.id);
      
      if (event) {
        return res.json(event);
      }
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Event not found' });
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('time', 'Time is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty()
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
        return res.status(401).json({ msg: 'Not authorized to create events' });
      }
      
      const {
        title,
        description,
        date,
        time,
        location,
        category,
        image,
        registrationEnabled,
        registrationDeadline
      } = req.body;
      
      // Build event object
      const eventFields = {
        createdBy: req.user.id,
        title,
        description,
        date,
        time,
        location
      };
      
      if (category) eventFields.category = category;
      if (image) eventFields.image = image;
      if (registrationEnabled) eventFields.registrationEnabled = registrationEnabled;
      if (registrationDeadline) eventFields.registrationDeadline = registrationDeadline;
      
      const newEvent = new Event(eventFields);
      const event = await newEvent.save();
      
      res.json(event);
    } catch (err) {
      console.error(err.message);
      
      // If database error and using mock data, create a mock event
      if (mockEvents) {
        const mongoose = require('mongoose');
        const {
          title,
          description,
          date,
          time,
          location,
          category,
          image,
          registrationEnabled,
          registrationDeadline
        } = req.body;
        
        const newEvent = {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          date,
          time,
          location,
          category: category || 'social',
          image: image || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3',
          registrationEnabled: registrationEnabled || true,
          registrationDeadline,
          attendees: [],
          createdBy: req.user.id,
          createdAt: new Date()
        };
        
        mockEvents.push(newEvent);
        
        return res.json(newEvent);
      }
      
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update events' });
    }
    
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      image,
      registrationEnabled,
      registrationDeadline
    } = req.body;
    
    // Build event object
    const eventFields = {};
    if (title) eventFields.title = title;
    if (description) eventFields.description = description;
    if (date) eventFields.date = date;
    if (time) eventFields.time = time;
    if (location) eventFields.location = location;
    if (category) eventFields.category = category;
    if (image) eventFields.image = image;
    if (registrationEnabled !== undefined) eventFields.registrationEnabled = registrationEnabled;
    if (registrationDeadline) eventFields.registrationDeadline = registrationDeadline;
    
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    );
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, update the mock event
    if (mockEvents) {
      const eventIndex = mockEvents.findIndex(e => e._id.toString() === req.params.id);
      
      if (eventIndex !== -1) {
        const {
          title,
          description,
          date,
          time,
          location,
          category,
          image,
          registrationEnabled,
          registrationDeadline
        } = req.body;
        
        // Update fields if provided
        if (title) mockEvents[eventIndex].title = title;
        if (description) mockEvents[eventIndex].description = description;
        if (date) mockEvents[eventIndex].date = date;
        if (time) mockEvents[eventIndex].time = time;
        if (location) mockEvents[eventIndex].location = location;
        if (category) mockEvents[eventIndex].category = category;
        if (image) mockEvents[eventIndex].image = image;
        if (registrationEnabled !== undefined) mockEvents[eventIndex].registrationEnabled = registrationEnabled;
        if (registrationDeadline) mockEvents[eventIndex].registrationDeadline = registrationDeadline;
        
        return res.json(mockEvents[eventIndex]);
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    await event.deleteOne();
    
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, delete the mock event
    if (mockEvents) {
      const eventIndex = mockEvents.findIndex(e => e._id.toString() === req.params.id);
      
      if (eventIndex !== -1) {
        mockEvents.splice(eventIndex, 1);
        return res.json({ msg: 'Event removed' });
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events/:id/register
// @desc    Register current user for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    if (!event.registrationEnabled) {
      return res.status(400).json({ msg: 'Registration is not enabled for this event' });
    }
    
    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ msg: 'Registration deadline has passed' });
    }
    
    // Check if user is already registered
    if (event.attendees.some(attendee => attendee.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Already registered for this event' });
    }
    
    // Add user to attendees
    event.attendees.unshift({ user: req.user.id });
    
    await event.save();
    
    res.json(event.attendees);
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, register user for the mock event
    if (mockEvents) {
      const eventIndex = mockEvents.findIndex(e => e._id.toString() === req.params.id);
      
      if (eventIndex !== -1) {
        const event = mockEvents[eventIndex];
        
        if (!event.registrationEnabled) {
          return res.status(400).json({ msg: 'Registration is not enabled for this event' });
        }
        
        // Check if registration deadline has passed
        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
          return res.status(400).json({ msg: 'Registration deadline has passed' });
        }
        
        // Check if user is already registered
        if (event.attendees.some(attendee => attendee.user.toString() === req.user.id)) {
          return res.status(400).json({ msg: 'Already registered for this event' });
        }
        
        // Add user to attendees
        const mongoose = require('mongoose');
        const newAttendee = {
          user: req.user.id,
          registeredAt: new Date()
        };
        
        event.attendees.unshift(newAttendee);
        
        return res.json(event.attendees);
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/events/:id/register
// @desc    Unregister current user from an event
// @access  Private
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is registered
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );
    
    if (attendeeIndex === -1) {
      return res.status(400).json({ msg: 'Not registered for this event' });
    }
    
    // Remove user from attendees
    event.attendees.splice(attendeeIndex, 1);
    
    await event.save();
    
    res.json(event.attendees);
  } catch (err) {
    console.error(err.message);
    
    // If database error and using mock data, unregister user from the mock event
    if (mockEvents) {
      const eventIndex = mockEvents.findIndex(e => e._id.toString() === req.params.id);
      
      if (eventIndex !== -1) {
        const event = mockEvents[eventIndex];
        
        // Check if user is registered
        const attendeeIndex = event.attendees.findIndex(
          attendee => attendee.user.toString() === req.user.id
        );
        
        if (attendeeIndex === -1) {
          return res.status(400).json({ msg: 'Not registered for this event' });
        }
        
        // Remove user from attendees
        event.attendees.splice(attendeeIndex, 1);
        
        return res.json(event.attendees);
      }
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router; 