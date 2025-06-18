import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../components/Navbar/AppContext'; 

const useAuth = (redirectIfNoToken = false) => { 
  const [usuario, setUsuario] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();
  const appContext = useAppContext();

  const clearUserSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('correoUsuario');
    localStorage.removeItem('nombreRol');
    setUsuario(null);
    if (appContext && typeof appContext.updateUserStatus === 'function') {
      appContext.updateUserStatus();
    }
  }, [appContext]);

  const handleLogout = useCallback(() => {
    clearUserSession();
    navigate('/');
  }, [clearUserSession, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoadingAuth(true);
    if (token) {
      axios.get('http://localhost:8080/usuario/datos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUsuario(response.data);
        if (appContext && typeof appContext.updateUserStatus === 'function') {
          appContext.updateUserStatus();
        }
      })
      .catch(() => {
        clearUserSession();
        if (redirectIfNoToken) { navigate('/'); } 
      })
      .finally(() => setLoadingAuth(false));
    } else {
      clearUserSession();
      if (redirectIfNoToken) { navigate('/'); } 
      setLoadingAuth(false);
    }
  }, [redirectIfNoToken, clearUserSession]);

  return { usuario, loadingAuth, handleLogout };
};

export default useAuth;