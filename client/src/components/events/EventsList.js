import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import axios from 'axios';
import './EventsList.css';

// Mock data is commented out, now using API data
// const mockEvents = [ ... ]

const EventsList = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { isAuthenticated, user } = authContext;
  const { setAlert } = alertContext;

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    onlyFuture: true,
    searchTerm: ''
  });

  useEffect(() => {
    // Fetch events from the API
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/events');
        setEvents(res.data);
        setFilteredEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err.message);
        setLoading(false);
        setAlert('Failed to load events', 'danger');
      }
    };

    fetchEvents();
  }, [setAlert]);

  useEffect(() => {
    // Apply filters
    let result = [...events];
    
    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(event => event.category === filters.category);
    }
    
    // Filter by date (only future events)
    if (filters.onlyFuture) {
      const today = new Date();
      result = result.filter(event => new Date(event.date) >= today);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(term) || 
          event.description.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredEvents(result);
  }, [filters, events]);

  const handleFilterChange = e => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const isPastDeadline = deadlineString => {
    const today = new Date();
    const deadline = new Date(deadlineString);
    return today > deadline;
  };

  const handleRegister = async (eventId) => {
    try {
      // Real API call to register for an event
      if (!isAuthenticated) {
        setAlert('You must be logged in to register for events', 'danger');
        return;
      }
      
      await axios.post(`/api/events/${eventId}/register`);
      setAlert('You have successfully registered for this event', 'success');
      
      // Refresh events to update registration status
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Registration error:', err.response?.data?.msg || err.message);
      setAlert(err.response?.data?.msg || 'Error registering for event', 'danger');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <h1 className="large text-primary">Upcoming Events</h1>
      
      <div className="events-filter bg-light">
        <h4>Filter Events</h4>
        <div className="form">
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
            >
              <option value="all">All Categories</option>
              <option value="career">Career</option>
              <option value="networking">Networking</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="workshop">Workshops</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="searchTerm">Search:</label>
            <input 
              type="text" 
              name="searchTerm" 
              value={filters.searchTerm} 
              onChange={handleFilterChange}
              placeholder="Search by title, description..."
            />
          </div>
          
          <div className="form-check">
            <input 
              type="checkbox" 
              name="onlyFuture" 
              checked={filters.onlyFuture} 
              onChange={handleFilterChange}
              id="onlyFuture"
            />
            <label htmlFor="onlyFuture">Show only upcoming events</label>
          </div>
        </div>
      </div>
      
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <p>No events found matching your criteria.</p>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="event-card bg-light">
              <div className="event-image">
                <img src={event.image} alt={event.title} />
              </div>
              <div className="event-details">
                <h2>{event.title}</h2>
                <p className="event-date">
                  <i className="fas fa-calendar-day"></i> {formatDate(event.date)} at {event.time}
                </p>
                <p className="event-location">
                  <i className="fas fa-map-marker-alt"></i> {event.location}
                </p>
                <p>{event.description}</p>
                
                <div className="event-registration">
                  {event.registrationEnabled ? (
                    isPastDeadline(event.registrationDeadline) ? (
                      <p className="text-danger">Registration has closed (deadline: {formatDate(event.registrationDeadline)})</p>
                    ) : (
                      <>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleRegister(event._id)}
                        >
                          Register Now
                        </button>
                        <p className="registration-info">Registration open until {formatDate(event.registrationDeadline)}</p>
                      </>
                    )
                  ) : (
                    <p>Registration not required</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsList; 