import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    return <Navigate to="/" />; // 🔁 redirect to login if not logged in
  }

  try {
    JSON.parse(storedUser); // Just to verify it's valid JSON
    return children;        // ✅ render child (HomePage)
  } catch (err) {
    console.error('Invalid user in localStorage:', err);
    localStorage.clear();
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
