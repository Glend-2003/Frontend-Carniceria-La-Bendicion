import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSignOutAlt
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { useAppContext } from "../Navbar/AppContext";
import NavbarApp from '../Navbar/NavbarApp';
import FooterApp from '../Footer/FooterApp';
import Carrito from '../Carrito/CarritoApp';
import SideBarUsuario from '../DetallesCliente/SideBarUsuario';
import { AppProvider } from "../Navbar/AppContext";
import './Dashboard.css';
import { getDecryptedLocalStorage } from '../Utils/StorageUtils';

const Dashboard = () => {
  const { usuario } = useAuth();
  const { handleLogout } = useAppContext();
  const [datosUsuario, setDatosUsuario] = useState({
    nombreUsuario: "",
    correoUsuario: "",
    idUsuario: "",
    nombreRol: ""
  });

  useEffect(() => {
    const obtenerDatosLocalStorage = () => {
      try {
        const nombreUsuario = localStorage.getItem('nombreUsuario') || "Usuario";
        const correoUsuario = localStorage.getItem('correoUsuario') || "";
        const idUsuario = localStorage.getItem('idUsuario') || "";
        const nombreRol = getDecryptedLocalStorage('nombreRol') || ""
        
        setDatosUsuario({
          nombreUsuario,
          correoUsuario,
          idUsuario,
          nombreRol
        });
      } catch (error) {
        console.error("Error al obtener datos del localStorage:", error);
      }
    };

    obtenerDatosLocalStorage();
  }, []);

  return (
    <>
    
    <AppProvider>
      <div className="dashboard-main">
        <NavbarApp />
        <div className="catalogo-hero">
      <div className="catalogo-hero-content">
        <h1>MI CUENTA </h1>
      </div>
    </div>
        <div className="dashboard-container">
          <SideBarUsuario usuario={datosUsuario} handleLogout={handleLogout} />

          <div className="dashboard-content">
            <div className="dashboard-header">
              <div className="welcome-section">
                <h1>Bienvenido, {datosUsuario.nombreUsuario}</h1>
                <p>¿Qué deseas hacer hoy?</p>
              </div>
              <div className="user-summary">
             
              </div>
            </div>

            <div className="action-menu">
              <h2>Gestiona tu cuenta</h2>
              <div className="menu-cards">
                <NavLink to="/orders" className="menu-card">
                  <div className="card-icon">
                    <FaFileAlt />
                  </div>
                  <div className="card-info">
                    <h3>Mis Pedidos</h3>
                    <p>Revisa el estado de tus compras</p>
                  </div>
                </NavLink>
                
                <NavLink to="/DireccionUsuario" className="menu-card">
                  <div className="card-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="card-info">
                    <h3>Dirección</h3>
                    <p>Gestiona tus direcciones de envío</p>
                  </div>
                </NavLink>
                
                <NavLink to="/PerfilUsuario" className="menu-card">
                  <div className="card-icon">
                    <FaUser />
                  </div>
                  <div className="card-info">
                    <h3>Mi Perfil</h3>
                    <p>Actualiza tus datos personales</p>
                  </div>
                </NavLink>
              </div>
              
              <div className="logout-container">
                <NavLink to="/" className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt className="logout-icon" />
                  <span>Cerrar sesión</span>
                </NavLink>
              </div>
            </div>
          </div>

          <Carrito />
        </div>
        
        <FooterApp />
      </div>
    </AppProvider>
    </>
  );
};

export default Dashboard;