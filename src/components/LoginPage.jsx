import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from 'react'; 
import '../styles/login.css';
import calendarImg from '../assets/calendar.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        role
      });

      const userRole = res.data?.user?.role;

      if (res.data.user && res.data.token) {
        if (userRole !== role) {
          alert(`This user is not registered as ${role}. Please select correct role.`);
          return;
        }

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        console.log("Login success — navigating to /home");
        navigate('/home');
      } else {
        alert("Invalid response from server");
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="left-pane">
        <img src={calendarImg} alt="Calendar" className="calendar-image" />
        <h1 className="app-title">EveCalendar</h1>
        <p className="tagline">Your personalized event manager.</p>
      </div>

      <div className="right-pane">
        <div className="login-form-box">
          <h2>Login to Continue</h2>
          <form className="login-form" onSubmit={handleSubmit}>

            <label htmlFor="role-select" className="role-label">Select Role:</label>
            <select
              id="role-select"
              className="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
