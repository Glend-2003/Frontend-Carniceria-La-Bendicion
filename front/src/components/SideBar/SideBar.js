import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaListAlt, FaComments, FaBoxOpen, FaPercentage, FaCreditCard, FaShoppingCart, FaChartLine, FaUserCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SideBar.css';

const SideBar = ({ usuario }) => {
    useEffect(() => {
        document.body.classList.add('admin-page');
        
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    return (
        <div className="admin-sidebar__container">
            <div className="admin-sidebar__inner">
                <div className="admin-sidebar__header">
                    <h3 className="admin-sidebar__title">Administrar datos</h3>
                </div>
                
                <div className="admin-sidebar__content">
                    <nav className="admin-sidebar__nav">
                        <NavLink to="/GestionarUsuario" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaUsers className="admin-sidebar__icon" /> Usuarios
                        </NavLink>
                        
                        <NavLink to="/CategoriaApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaListAlt className="admin-sidebar__icon" /> Categorías
                        </NavLink>
                        
                        <NavLink to="/ComentarioApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaComments className="admin-sidebar__icon" /> Comentarios
                        </NavLink>
                        
                        <NavLink to="/ProductoApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaBoxOpen className="admin-sidebar__icon" /> Productos
                        </NavLink>
                        
                        <NavLink to="/PromocionApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaPercentage className="admin-sidebar__icon" /> Promociones
                        </NavLink>
                        
                        <NavLink to="/TipoPagoApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaCreditCard className="admin-sidebar__icon" /> Tipo Pago
                        </NavLink>
                        
                        <NavLink to="/PedidosApp" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaShoppingCart className="admin-sidebar__icon" /> Pedidos
                        </NavLink>
                        
                        <NavLink to="/VentaPedido" className={({ isActive }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link"}>
                            <FaChartLine className="admin-sidebar__icon" /> Ventas
                        </NavLink>
                    </nav>
                </div>
                
                <div className="admin-sidebar__footer">
                    <NavLink to="/principal" className={({ isActive }) => isActive ? "admin-sidebar__profile admin-sidebar__profile--active" : "admin-sidebar__profile"}>
                        <div className="admin-sidebar__avatar">
                            <FaUserCircle className="admin-sidebar__avatar-icon" />
                        </div>
                        <div className="admin-sidebar__user-info">
                            <span className="admin-sidebar__user-name">{usuario ? usuario.nombreUsuario : "Usuario"}</span>
                            <span className="admin-sidebar__user-role">Ver perfil</span>
                        </div>
                    </NavLink>
                </div>
            </div>
            
        </div>
    );
};

export default SideBar;