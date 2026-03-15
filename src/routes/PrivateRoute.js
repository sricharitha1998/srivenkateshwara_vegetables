import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const userString = localStorage.getItem("user");
  let isAuthenticated = false;

  if (userString) {
    try {
      const user = JSON.parse(userString);
      // Ensure access and refresh tokens are valid
      if (user && user.access && user.refresh) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }

  // If no valid session, redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return <React.Fragment>{children}</React.Fragment>;
};

export default PrivateRoute;
