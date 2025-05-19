import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaSignOutAlt,
  FaAngleRight
} from 'react-icons/fa';
import './SideBarUsuario.css';
import { getDecryptedLocalStorage } from '../Utils/StorageUtils';

const SideBarUsuario = ({ usuario, handleLogout }) => {
    const [datosUsuario, setDatosUsuario] = useState({
        nombreUsuario: usuario?.nombreUsuario || "Usuario",
        correoUsuario: usuario?.correoUsuario || "",
        nombreRol: usuario?.nombreRol || ""
    });
    
    const [menuColapsado, setMenuColapsado] = useState(false);
    
    useEffect(() => {
        if (usuario) {
            setDatosUsuario({
                nombreUsuario: usuario.nombreUsuario || localStorage.getItem('nombreUsuario') || "Usuario",
                correoUsuario: usuario.correoUsuario || localStorage.getItem('correoUsuario') || "",
                nombreRol: usuario.nombreRol || getDecryptedLocalStorage('nombreRol') || "" 
            });
        } else {
            // Si no hay usuario en props, cargar desde localStorage
            setDatosUsuario({
                nombreUsuario: localStorage.getItem('nombreUsuario') || "Usuario",
                correoUsuario: localStorage.getItem('correoUsuario') || "",
                nombreRol: getDecryptedLocalStorage('nombreRol') || "" // Cambiado aquí
            });
        }
    }, [usuario]);
    
    const toggleMenu = () => {
        setMenuColapsado(!menuColapsado);
    };

    return (
        <>
            <button className="sidebar-toggle" onClick={toggleMenu}>
                <FaAngleRight className={`toggle-icon ${menuColapsado ? 'rotated' : ''}`} />
            </button>
            
            <div className={`sidebar-container ${menuColapsado ? 'collapsed' : ''}`}>
                <div className="user-profile">
                    <div className="avatar-circle">
                        {datosUsuario.nombreUsuario.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h3 className="user-name">{datosUsuario.nombreUsuario}</h3>
                        <p className="user-email">{datosUsuario.correoUsuario}</p>
                        {datosUsuario.nombreRol && (
                            <span className="user-role">{datosUsuario.nombreRol}</span>
                        )}
                    </div>
                </div>
                
                <div className="sidebar-divider"></div>
                
                <nav className="sidebar-nav">
                    <NavLink 
                        to="/dashboard" 
                        className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                    >
                        <FaHome className="sidebar-icon" /> 
                        <span className="sidebar-text">Inicio</span>
                    </NavLink>
                    
                    <NavLink 
                        to="/orders" 
                        className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                    >
                        <FaFileAlt className="sidebar-icon" /> 
                        <span className="sidebar-text">Pedidos</span>
                    </NavLink>
                    
                    <NavLink 
                        to="/DireccionUsuario" 
                        className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                    >
                        <FaMapMarkerAlt className="sidebar-icon" /> 
                        <span className="sidebar-text">Dirección</span>
                    </NavLink>
                    
                    <NavLink 
                        to="/PerfilUsuario" 
                        className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                    >
                        <FaUser className="sidebar-icon" /> 
                        <span className="sidebar-text">Mi Perfil</span>
                    </NavLink>
                </nav>
                
                <div className="sidebar-divider"></div>
                
                <NavLink 
                    to="/" 
                    className="sidebar-link logout"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt className="sidebar-icon" /> 
                    <span className="sidebar-text">Cerrar sesión</span>
                </NavLink>
            </div>
        </>
    );
};

export default SideBarUsuario;