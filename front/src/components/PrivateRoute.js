
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from './Navbar/AppContext';
import { getDecryptedLocalStorage } from './Utils/StorageUtils';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = getDecryptedLocalStorage('nombreRol'); // Cambiado

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles) {
    if (!userRole) {
      return <Navigate to="/" replace />;
    }
    
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

export default PrivateRoute;