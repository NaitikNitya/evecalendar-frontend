import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/home.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendar, setShowCalendar] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (err) {
        console.error('❌ Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (date) => new Date(date).toDateString();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddEvent = async () => {
    if (eventTitle.trim() && eventTime.trim() && eventVenue.trim()) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_BASE_URL}/api/events`,
          {
            title: eventTitle,
            description: `Event at ${eventVenue} on ${eventTime}`,
            date: selectedDate.toISOString().split('T')[0],
            location: eventVenue,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newEvent = response.data;
        setEvents((prev) => [...prev, newEvent]);
        setEventTitle('');
        setEventTime('');
        setEventVenue('');
        setShowEventForm(false);
      } catch (err) {
        console.error('❌ Event creation error:', err);
        console.log('📛 Server Response:', err.response?.data || err.message);
        alert('Event creation failed. Try again.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  const handleRSVP = (index) => {
    const updatedEvents = [...events];
    const alreadyRSVPed = updatedEvents[index].rsvps?.includes(user?.name);

    if (alreadyRSVPed) {
      updatedEvents[index].rsvps = updatedEvents[index].rsvps.filter(
        (name) => name !== user?.name
      );
    } else {
      updatedEvents[index].rsvps = [...(updatedEvents[index].rsvps || []), user?.name];
    }

    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (index) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    setEvents(updatedEvents);
  };

  const handleEditEvent = async (eventIndex) => {
    const eventToEdit = events[eventIndex];

    const newTitle = prompt("Enter new title:", eventToEdit.title);
    const newDate = prompt("Enter new date (YYYY-MM-DD):", eventToEdit.date);

    if (!newTitle || !newDate) {
      alert("Edit cancelled or invalid input.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE_URL}/api/events/${eventToEdit._id}`,
        {
          title: newTitle,
          date: newDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedEvents = [...events];
      updatedEvents[eventIndex] = res.data;
      setEvents(updatedEvents);

      alert("Event updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update event");
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="sidebar">
        <h2 className="app-title">Eve Calendar</h2>

        {user?.role === 'admin' && (
          <>
            <button onClick={() => setShowEventForm(!showEventForm)}>
              {showEventForm ? 'Close Form' : 'Create New Event'}
            </button>

            {showEventForm && (
              <div className="event-form">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
                <button onClick={handleAddEvent}>Add Event</button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="main-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
          }}
        >
          <h2 style={{ fontSize: '26px', margin: 0 }}>
            Welcome, {user?.role === 'admin' ? 'Admin' : 'Student'} {user?.name || 'Guest'}!
          </h2>

          <div className="top-right-controls">
            <button className="toggle-calendar-btn" onClick={() => setShowCalendar(!showCalendar)}>
              {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <section className="search-section">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </section>

        <section className="date-circles-section">
          {[...new Set(events.map((e) => e.date))].map((dateStr, i) => {
            const dateObj = new Date(dateStr);
            return (
              <button
                key={i}
                className={`circle ${
                  formatDate(dateObj) === formatDate(selectedDate) ? 'active' : ''
                }`}
                onClick={() => setSelectedDate(dateObj)}
              >
                {dateObj.getDate()}
              </button>
            );
          })}
        </section>

        {showCalendar && (
          <section className="calendar-section">
            <Calendar onClickDay={setSelectedDate} value={selectedDate} />
          </section>
        )}

        <section className="events-section">
          <h3>Upcoming Events</h3>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, idx) => {
              const eventIndex = events.findIndex(
                (e) => e.title === event.title && e.date === event.date
              );
              const isRSVPed = event.rsvps?.includes(user?.name);

              return (
                <div key={idx} className="event-card">
                  <strong>{event.title}</strong>
                  <div>{new Date(event.date).toDateString()}</div>
                  <div>{event.description}</div>
                  <div style={{ marginTop: '10px' }}>
                    {user?.role === 'student' && (
                      <button
                        className={`rsvp-btn ${isRSVPed ? 'leave' : 'join'}`}
                        onClick={() => handleRSVP(eventIndex)}
                      >
                        {isRSVPed ? 'Cancel RSVP' : 'RSVP'}
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditEvent(eventIndex)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEvent(eventIndex)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No matching events.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
