import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FaUserCircle, 
    FaEnvelope, 
    FaIdBadge, 
    FaCogs,
    FaUsers,
    FaListAlt,
    FaComments,
    FaBoxOpen,
    FaPercentage,
    FaCreditCard,
    FaShoppingCart,
    FaChartLine
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import SideBar from '../SideBar/SideBar';
import FooterApp from '../Footer/FooterApp';
import { useAppContext } from "../Navbar/AppContext";
import "./Principal.css";

const PrincipalAdmin = () => {
    const { usuario } = useAuth();
    const { handleLogout } = useAppContext();

    // Array de accesos rápidos para administración
    const adminQuickAccess = [
        { 
            path: '/GestionarUsuario', 
            name: 'Usuarios', 
            icon: <FaUsers size={32} />, 
            description: 'Gestión de usuarios del sistema', 
            color: 'var(--primary-medium)' 
        },
        { 
            path: '/CategoriaApp', 
            name: 'Categorías', 
            icon: <FaListAlt size={32} />, 
            description: 'Administrar categorías de productos', 
            color: 'var(--primary-light)' 
        },
        { 
            path: '/ComentarioApp', 
            name: 'Comentarios', 
            icon: <FaComments size={32} />, 
            description: 'Ver y gestionar comentarios', 
            color: 'var(--accent-gold)' 
        },
        { 
            path: '/ProductoApp', 
            name: 'Productos', 
            icon: <FaBoxOpen size={32} />, 
            description: 'Administrar inventario de productos', 
            color: 'var(--primary-dark)' 
        },
        { 
            path: '/PromocionApp', 
            name: 'Promociones', 
            icon: <FaPercentage size={32} />, 
            description: 'Gestionar promociones y descuentos', 
            color: 'var(--accent-brown)' 
        },
        { 
            path: '/TipoPagoApp', 
            name: 'Tipo Pago', 
            icon: <FaCreditCard size={32} />, 
            description: 'Configurar métodos de pago', 
            color: 'var(--primary-medium)' 
        },
        { 
            path: '/PedidosApp', 
            name: 'Pedidos', 
            icon: <FaShoppingCart size={32} />, 
            description: 'Ver y gestionar pedidos actuales', 
            color: 'var(--primary-light)' 
        },
        { 
            path: '/VentaPedido', 
            name: 'Ventas', 
            icon: <FaChartLine size={32} />, 
            description: 'Consultar historial de ventas', 
            color: 'var(--accent-gold)' 
        }
    ];

    return (
        <main className="admin-dashboard">
            <SideBar usuario={usuario} adminPanel={true} />

            <section className="admin-content-area">
                <header className="admin-welcome-header">
                    {/* Espacio reservado para banner de administración */}
                </header>

                <div className="admin-dashboard-container">
                    <article className="admin-profile-card">
                        <header className="admin-profile-header">
                            <figure className="admin-avatar">
                                <FaUserCircle size={80} />
                            </figure>
                            <span className="admin-role-badge">
                                {usuario?.rol?.nombreRol || "Administrador"}
                            </span>
                        </header>
                        
                        <section className="admin-profile-details">
                            <h2 className="admin-profile-title">{usuario ? `${usuario.nombreUsuario} ${usuario.primerApellido}` : "Cargando..."}</h2>
                            
                            <dl className="admin-profile-info">
                                <div className="admin-info-item">
                                    <dt className="admin-info-icon">
                                        <FaUserCircle />
                                    </dt>
                                    <dd className="admin-info-content">
                                        <span className="admin-info-label">Nombre completo</span>
                                        <span className="admin-info-value">{usuario ? `${usuario.nombreUsuario} ${usuario.primerApellido}` : "..."}</span>
                                    </dd>
                                </div>
                                
                                <div className="admin-info-item">
                                    <dt className="admin-info-icon">
                                        <FaEnvelope />
                                    </dt>
                                    <dd className="admin-info-content">
                                        <span className="admin-info-label">Correo electrónico</span>
                                        <span className="admin-info-value">{usuario?.correoUsuario || "..."}</span>
                                    </dd>
                                </div>
                                
                                <div className="admin-info-item">
                                    <dt className="admin-info-icon">
                                        <FaIdBadge />
                                    </dt>
                                    <dd className="admin-info-content">
                                        <span className="admin-info-label">Rol en el sistema</span>
                                        <span className="admin-info-value">{usuario?.rol?.nombreRol || "..."}</span>
                                    </dd>
                                </div>
                                
                                <div className="admin-info-item">
                                    <dt className="admin-info-icon">
                                        <FaCogs />
                                    </dt>
                                    <dd className="admin-info-content">
                                        <span className="admin-info-label">Acciones administrativas</span>
                                        <div className="admin-action-buttons">
                                            <button className="admin-logout-btn" onClick={handleLogout}>
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </article>
                    
                    <section className="admin-tools-section">
                        <h3 className="admin-section-title">Panel de Administración</h3>
                        <nav className="admin-quick-access-grid">
                            {adminQuickAccess.map((item, index) => (
                                <NavLink to={item.path} key={index} className="admin-quick-access-card">
                                    <figure className="admin-card-icon" style={{ backgroundColor: item.color }}>
                                        {item.icon}
                                    </figure>
                                    <div className="admin-card-content">
                                        <h4>{item.name}</h4>
                                        <p>{item.description}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </nav>
                    </section>
                </div>
            </section>
            
            <FooterApp adminFooter={true} />
        </main>
    );
};

export default PrincipalAdmin;