import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
  const userString = localStorage.getItem("user");
  let isAuthenticated = false;

  if (userString) {
    try {
      const user = JSON.parse(userString);
      // Check if access and refresh tokens exist
      if (user && user.access && user.refresh) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }

  // If the user already has valid tokens, redirect them directly to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the Login/Register page
  return <React.Fragment>{children}</React.Fragment>;
};

export default AuthRoute;
