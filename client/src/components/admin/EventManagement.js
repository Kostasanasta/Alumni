import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import './EventManagement.css';

// Mock data is commented out, now using API data
// const mockEvents = [ ... ]

const EventManagement = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { user, loading } = authContext;
  const { setAlert } = alertContext;

  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'social',
    image: '',
    registrationEnabled: true,
    registrationDeadline: ''
  });

  useEffect(() => {
    // Fetch events from the API
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api/events');
        setEvents(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err.message);
        setIsLoading(false);
        setAlert('Failed to load events', 'danger');
      }
    };

    fetchEvents();
  }, [setAlert]);

  useEffect(() => {
    if (currentEvent && editMode) {
      // Format date for the form
      const eventDate = new Date(currentEvent.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Format registration deadline for the form if it exists
      let formattedDeadline = '';
      if (currentEvent.registrationDeadline) {
        const deadlineDate = new Date(currentEvent.registrationDeadline);
        formattedDeadline = deadlineDate.toISOString().split('T')[0];
      }

      setFormData({
        title: currentEvent.title,
        description: currentEvent.description,
        date: formattedDate,
        time: currentEvent.time,
        location: currentEvent.location,
        category: currentEvent.category || 'social',
        image: currentEvent.image || '',
        registrationEnabled: currentEvent.registrationEnabled || false,
        registrationDeadline: formattedDeadline
      });
    }
  }, [currentEvent, editMode]);

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
  } = formData;

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'social',
      image: '',
      registrationEnabled: true,
      registrationDeadline: ''
    });
    setEditMode(false);
    setCurrentEvent(null);
  };

  const handleAddEvent = async e => {
    e.preventDefault();

    if (!title || !description || !date || !time || !location) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    if (registrationEnabled && !registrationDeadline) {
      setAlert('Registration deadline is required when registration is enabled', 'danger');
      return;
    }

    try {
      const newEventData = {
        ...formData
      };

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/events', newEventData, config);
      
      // Add the new event to the current list
      setEvents([res.data, ...events]);
      setAlert('Event added successfully', 'success');
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding event:', err.response?.data?.msg || err.message);
      setAlert(err.response?.data?.msg || 'Error adding event', 'danger');
    }
  };

  const handleUpdateEvent = async e => {
    e.preventDefault();

    if (!title || !description || !date || !time || !location) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    if (registrationEnabled && !registrationDeadline) {
      setAlert('Registration deadline is required when registration is enabled', 'danger');
      return;
    }

    try {
      const updatedEventData = {
        ...formData
      };

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.put(`/api/events/${currentEvent._id}`, updatedEventData, config);
      
      // Update the event in the current list
      const updatedEvents = events.map(event => 
        event._id === currentEvent._id ? res.data : event
      );

      setEvents(updatedEvents);
      setAlert('Event updated successfully', 'success');
      resetForm();
      setEditMode(false);
    } catch (err) {
      console.error('Error updating event:', err.response?.data?.msg || err.message);
      setAlert(err.response?.data?.msg || 'Error updating event', 'danger');
    }
  };

  const handleDeleteEvent = async id => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${id}`);
        
        // Remove the event from the current list
        setEvents(events.filter(event => event._id !== id));
        
        if (currentEvent && currentEvent._id === id) {
          resetForm();
          setEditMode(false);
        }
        
        setAlert('Event deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting event:', err.response?.data?.msg || err.message);
        setAlert(err.response?.data?.msg || 'Error deleting event', 'danger');
      }
    }
  };

  const handleEditClick = event => {
    setCurrentEvent(event);
    setEditMode(true);
    setShowAddForm(false);
  };

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isPastEvent = dateString => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today > eventDate;
  };

  const sortEventsByDate = (events) => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading || !user || isLoading) {
    return <Spinner />;
  }

  return (
    <div className="event-management-container">
      <header className="event-management-header">
        <div className="header-content">
          <h1 className="page-title">Event Management</h1>
          <div className="header-actions">
            <Link to="/dashboard" className="btn-back">
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </Link>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditMode(false);
                resetForm();
              }}
            >
              <i className="fas fa-plus"></i> {showAddForm ? 'Hide Form' : 'Add Event'}
            </button>
          </div>
        </div>
      </header>
      
      {showAddForm && !editMode && (
        <div className="event-form-container bg-light">
          <h2 className="form-title">Add New Event</h2>
          <form onSubmit={handleAddEvent} className="event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title*</label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                name="description"
                value={description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Time*</label>
                <input
                  type="time"
                  name="time"
                  value={time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                value={category}
                onChange={handleInputChange}
              >
                <option value="career">Career</option>
                <option value="networking">Networking</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                name="image"
                value={image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                name="registrationEnabled"
                checked={registrationEnabled}
                onChange={handleInputChange}
                id="registrationEnabled"
              />
              <label htmlFor="registrationEnabled">Enable Registration</label>
            </div>
            
            {registrationEnabled && (
              <div className="form-group">
                <label htmlFor="registrationDeadline">Registration Deadline*</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={registrationDeadline}
                  onChange={handleInputChange}
                  required={registrationEnabled}
                />
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-save"></i> Save Event
              </button>
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {editMode && currentEvent && (
        <div className="event-form-container bg-light">
          <h2 className="form-title">Edit Event</h2>
          <form onSubmit={handleUpdateEvent} className="event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title*</label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                name="description"
                value={description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Time*</label>
                <input
                  type="time"
                  name="time"
                  value={time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                name="category"
                value={category}
                onChange={handleInputChange}
              >
                <option value="career">Career</option>
                <option value="networking">Networking</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                name="image"
                value={image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                name="registrationEnabled"
                checked={registrationEnabled}
                onChange={handleInputChange}
                id="registrationEnabled"
              />
              <label htmlFor="registrationEnabled">Enable Registration</label>
            </div>
            
            {registrationEnabled && (
              <div className="form-group">
                <label htmlFor="registrationDeadline">Registration Deadline*</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={registrationDeadline}
                  onChange={handleInputChange}
                  required={registrationEnabled}
                />
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-save"></i> Update Event
              </button>
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={() => {
                  resetForm();
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="events-list-admin">
        <h2 className="section-title">All Events</h2>
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Category</th>
                <th>Registration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortEventsByDate(events).map(event => (
                <tr key={event._id} className={isPastEvent(event.date) ? 'past-event' : ''}>
                  <td>{event.title}</td>
                  <td>
                    {formatDate(event.date)} at {event.time}
                    {isPastEvent(event.date) && <span className="past-event-badge">Past</span>}
                  </td>
                  <td>{event.location}</td>
                  <td>
                    <span className={`category-badge ${event.category}`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </td>
                  <td>
                    {event.registrationEnabled ? (
                      <div>
                        <span className="registration-enabled">Enabled</span>
                        <p className="registration-count">
                          <i className="fas fa-users"></i> {event.attendees ? event.attendees.length : 0}
                        </p>
                      </div>
                    ) : (
                      <span className="registration-disabled">Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditClick(event)}
                        title="Edit Event"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteEvent(event._id)}
                        title="Delete Event"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventManagement; 