import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFileAlt, FaDownload, FaMapMarkerAlt, FaUser, FaSignOutAlt, FaCheck, FaClock, FaFilter, FaSearch, FaTimes, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NavbarApp from "../Navbar/NavbarApp";
import FooterApp from '../Footer/FooterApp';
import PaginacionApp from '../Paginacion/PaginacionApp';
import './Orders.css';
import SideBarUsuario from '../DetallesCliente/SideBarUsuario';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Orders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [estadoEntrega, setEstadoEntrega] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [estadoPedido, setEstadoPedido] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidosPaginados, setPedidosPaginados] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const itemsPerPage = 5;
  
  // Estados para Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Estados para diálogo de confirmación
  const [openDialog, setOpenDialog] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);

  const generarCodigoPedido = (idPedido, fechaPedido) => {
    const fecha = new Date(fechaPedido);
    const año = fecha.getFullYear().toString().substring(2); 
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); 
    const idFormateado = idPedido.toString().padStart(5, '0');
    
    return `PED-${año}${mes}-${idFormateado}`;
  };
  
  // Función para mostrar Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Función para cerrar Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Función para abrir diálogo de confirmación
  const handleOpenDialog = (idPedido) => {
    setPedidoACancelar(idPedido);
    setOpenDialog(true);
  };

  // Función para cerrar diálogo de confirmación
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    const loadUserAndOrders = async () => {
      try {
        setLoading(true);

        const idUsuario = localStorage.getItem('idUsuario');
        const nombreUsuario = localStorage.getItem('nombreUsuario');

        if (!idUsuario) {
          setError("No hay sesión de usuario activa. Por favor, inicie sesión nuevamente.");
          setLoading(false);
          return;
        }

        const usuarioObj = {
          idUsuario: idUsuario,
          nombreUsuario: nombreUsuario || "Usuario"
        };

        setUsuario(usuarioObj);
        await fetchPedidos(idUsuario);
        
      } catch (error) {
        setError("Error al cargar los datos. Por favor, inténtelo nuevamente.");
        setLoading(false);
      }
    };

    loadUserAndOrders();
  }, []);
  
  useEffect(() => {
    if (pedidos.length > 0) {
      setTotalPages(Math.ceil(pedidos.length / itemsPerPage));
      paginarPedidos(currentPage);
    } else {
      setPedidosPaginados([]);
      setTotalPages(1);
    }
  }, [pedidos, currentPage]);
  
  const paginarPedidos = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pedidosSlice = pedidos.slice(startIndex, endIndex);
    setPedidosPaginados(pedidosSlice);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const formatDateToString = (date) => {
    if (!date) return null;
    
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return null;
    }
  };
  
  const formatearFechaCompleta = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      const fecha = new Date(fechaString);
      
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      
      return `${dia}/${mes}/${anio} - Retiro: ${horas}:${minutos}`;
    } catch (error) {
      return 'Error de formato de fecha';
    }
  };
  
  const fetchPedidos = async (idUsuario, filters = {}) => {
    try {
      setLoading(true);
      
      let url = `http://localhost:8080/pedido/usuario/${idUsuario}`;
      
      if (Object.keys(filters).length > 0) {
        url = `http://localhost:8080/pedido/filtrar?idUsuario=${idUsuario}`;
        
        if (filters.estadoEntrega) {
          url += `&estadoEntrega=${encodeURIComponent(filters.estadoEntrega)}`;
        }
        
        if (filters.fechaInicio) {
          const formattedDate = formatDateToString(filters.fechaInicio);
          url += `&fechaInicio=${encodeURIComponent(formattedDate)}`;
        }
        
        if (filters.fechaFin) {
          const formattedDate = formatDateToString(filters.fechaFin);
          url += `&fechaFin=${encodeURIComponent(formattedDate)}`;
        }
        
        if (filters.estadoPedido) {
          url += `&estadoPedido=${filters.estadoPedido}`;
        }
        
        setFiltrosAplicados(true);
      } else {
        setFiltrosAplicados(false);
      }
      
      const response = await axios.get(url);
      
      if (!response.data || response.data.length === 0) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      const pedidosFormateados = response.data.map(pedido => ({
        idPedido: pedido.idPedido,
        codigoPedido: generarCodigoPedido(pedido.idPedido, pedido.fechaPedido),
        montoTotalPedido: pedido.montoTotalPedido || 0,
        fechaPedido: pedido.fechaPedido,
        fechaFormateada: formatearFechaCompleta(pedido.fechaPedido),
        estadoPedido: pedido.estadoPedido,
        estadoPedidoTexto: pedido.estadoPedidoTexto || 'Estado desconocido',
        estadoEntregaPedido: pedido.estadoEntregaPedido || "Pendiente",
        descripcionTipoPago: pedido.tipoPago?.descripcionTipoPago || 'Pago no especificado',
        productos: pedido.carrito?.productos?.map(producto => ({
          idProducto: producto.idProducto,
          nombreProducto: producto.nombreProducto || 'Producto sin nombre',
          imgProducto: producto.imgProducto || '',
          montoPrecioProducto: producto.montoPrecioProducto || 0,
          cantidadProducto: producto.cantidadProducto || 1,
          tipoPesoProducto: producto.tipoPesoProducto || 'unidad'
        })) || []
      }));

      setPedidos(pedidosFormateados);
      setCurrentPage(1);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error("Error en fetchPedidos:", error);
      
      if (Object.keys(filters).length > 0) {
        setPedidos([]);
        setError(null);
      } else {
        setError("No tiene historial de pedidos.");
      }
      
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const filters = {};
    
    if (estadoEntrega) {
      filters.estadoEntrega = estadoEntrega;
    }
    
    if (fechaInicio) {
      filters.fechaInicio = fechaInicio;
    }
    
    if (fechaFin) {
      filters.fechaFin = fechaFin;
    }
    
    if (estadoPedido) {
      filters.estadoPedido = estadoPedido;
    }
    
    fetchPedidos(usuario.idUsuario, filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setEstadoEntrega('');
    setFechaInicio(null);
    setFechaFin(null);
    setEstadoPedido('');
    setFiltrosAplicados(false);
    
    fetchPedidos(usuario.idUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('correoUsuario');
    localStorage.removeItem('nombreRol');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  

   const cancelarPedidoYNotificar = async () => {
    if (!pedidoACancelar) return;
    
    try {
      await axios.delete(`http://localhost:8080/pedido/eliminar/${pedidoACancelar}`);
      showSnackbar("Pedido cancelado con éxito. Se notificará a la carnicería.", "success");

      await crearNotificacion(usuario.idUsuario);
      fetchPedidos(usuario.idUsuario);

    } catch (error) {
      console.error("Error al cancelar el pedido:", error);
      showSnackbar("Ocurrió un error al cancelar el pedido.", "error");
    } finally {
      handleCloseDialog();
    }
  };

  const crearNotificacion = async (idUsuario) => {
    try {
      const response = await axios.post("http://localhost:8080/notificacion/agregar", {
        idUsuario: {
          idUsuario: idUsuario
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error("Error al crear notificación:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getEstadoEntregaIcon = (estado) => {
    switch(estado) {
      case "Pendiente":
        return <FaClock className="estado-icon pending" />;
      case "En Proceso":
        return <FaCog className="estado-icon processing" />;
      case "Listo":
      case "Entregado":
        return <FaCheck className="estado-icon delivered" />;
      case "Cancelado":
        return <FaTimes className="estado-icon cancelled" />;
      default:
        return <FaExclamationTriangle className="estado-icon unknown" />;
    }
  };

  const isPendiente = (estado) => {
    return estado === "Pendiente";
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case "Pendiente": return "status-pending";
      case "En Proceso": return "status-processing";
      case "Listo":
      case "Entregado": return "status-delivered";
      case "Cancelado": return "status-cancelled";
      default: return "status-unknown";
    }
  };

  const getMensajeNoResultados = () => {
    if (filtrosAplicados) {
      let mensaje = "No se encontraron pedidos";
      
      if (estadoEntrega) {
        mensaje += ` con estado "${estadoEntrega}"`;
      }
      
      if (fechaInicio || fechaFin) {
        mensaje += " en el rango de fechas seleccionado";
      }
      
      if (estadoPedido) {
        const estadoTexto = estadoPedido === "1" ? "activos" : "inactivos";
        mensaje += ` que estén ${estadoTexto}`;
      }
      
      return mensaje;
    }
    
    return "No se encontraron pedidos con los criterios seleccionados";
  };

  return (
<>
    
    <div className="orders-page">
        <NavbarApp />
        <div className="catalogo-hero">
      <div className="catalogo-hero-content">
        <h1>MIS PEDIDOS </h1>
      </div>
    </div>
      
      <div className="perfil-usuario-container">
        <SideBarUsuario usuario={usuario} handleLogout={handleLogout} />

        <div className="orders-content">
          <div className="orders-header">
            <h2 className="orders-title">Mis Pedidos</h2>
            <button 
              className={`filter-button ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
          
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-header">
                <h3>Filtrar pedidos</h3>
                <button 
                  className="close-filters"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Estado de entrega:</label>
                  <select 
                    value={estadoEntrega} 
                    onChange={(e) => setEstadoEntrega(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Listo">Listo</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Estado del pedido:</label>
                  <select 
                    value={estadoPedido} 
                    onChange={(e) => setEstadoPedido(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todos</option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Fecha desde:</label>
                  <DatePicker
                    selected={fechaInicio}
                    onChange={date => setFechaInicio(date)}
                    showTimeSelect
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="Seleccione fecha inicial"
                    isClearable
                    className="date-picker"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Fecha hasta:</label>
                  <DatePicker
                    selected={fechaFin}
                    onChange={date => setFechaFin(date)}
                    showTimeSelect
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText="Seleccione fecha final"
                    isClearable
                    className="date-picker"
                  />
                </div>
              </div>
              
              <div className="filter-actions">
                <button className="apply-filters" onClick={handleApplyFilters}>
                  <FaSearch /> Aplicar filtros
                </button>
                <button className="clear-filters" onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="loading-container">
              <p>Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={() => fetchPedidos(usuario.idUsuario)} className="retry-button">
                  Intentar nuevamente
                </button>
                {error.includes("sesión") && (
                  <button onClick={() => window.location.href = '/login'} className="login-button">
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="no-orders">
              <p>{getMensajeNoResultados()}</p>
              {filtrosAplicados ? (
                <button onClick={handleClearFilters} className="shop-now-button">
                  Quitar filtros
                </button>
              ) : (
                <NavLink to="/productos" className="shop-now-button">
                  Comprar ahora
                </NavLink>
              )}
            </div>
          ) : (
            <>
              <div className="orders-list">
                {pedidosPaginados.map(pedido => (
                  <div key={pedido.idPedido} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        Pedido {pedido.codigoPedido}
                      </div>
                      <div className="order-date">
                        {pedido.fechaFormateada}
                      </div>
                    </div>
                    
                    <div className="order-status">
                      <div className="status-indicator">
                        {getEstadoEntregaIcon(pedido.estadoEntregaPedido)}
                        <span className={`status-text ${getEstadoClass(pedido.estadoEntregaPedido)}`}>
                          {pedido.estadoEntregaPedido}
                        </span>
                      </div>
                      <div className="payment-method">
                        Método de pago: {pedido.descripcionTipoPago}
                      </div>
                    </div>
                    
                    <div className="order-products">
                      {pedido.productos && pedido.productos.map(producto => (
                        <div key={`${pedido.idPedido}-${producto.idProducto}`} className="product-item">
                          <div className="product-details">
                            <div className="product-name">{producto.nombreProducto}</div>
                            <div className="product-quantity">
                              {producto.cantidadProducto} {producto.tipoPesoProducto === 'unidad' ? 'unidad(es)' : `${producto.tipoPesoProducto}(s)`}
                            </div>
                            <div className="product-price">
                              ₡{(producto.montoPrecioProducto * producto.cantidadProducto).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-footer">
                      <div className="order-total">
                        Total: ₡{pedido.montoTotalPedido.toLocaleString()}
                      </div>
                      
                      <div className="order-actions">
                        {isPendiente(pedido.estadoEntregaPedido) && (
                                     <button 
                className="cancel-button" 
                onClick={() => handleOpenDialog(pedido.idPedido)}
              >
                Cancelar
              </button>

                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {pedidos.length > 0 && (
                <PaginacionApp 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                />
              )}
            </>
          )}
        </div>
      </div>
        <FooterApp />
      </div>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmación para cancelar pedido */}
    <Dialog
  open={openDialog}
  onClose={handleCloseDialog}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  PaperProps={{
    sx: {
      borderRadius: '12px',
      padding: '20px',
      width: '450px',
      maxWidth: '90vw',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      border: '1px solid rgba(0, 0, 0, 0.1)'
    }
  }}
>
  <DialogTitle 
    id="alert-dialog-title"
    sx={{
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2c3e50',
      textAlign: 'center',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }}
  >
    <FaExclamationTriangle 
      style={{ 
        color: '#e74c3c',
        fontSize: '1.8rem'
      }} 
    />
    Confirmar cancelación
  </DialogTitle>

  <div style={{
    padding: '0 24px 20px',
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#555'
  }}>
    ¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.
  </div>

  <DialogActions sx={{
    justifyContent: 'center',
    padding: '0 24px 20px',
    gap: '20px'
  }}>
    <Button 
      onClick={handleCloseDialog}
      variant="outlined"
      sx={{
        textTransform: 'none',
        fontSize: '1rem',
        padding: '8px 24px',
        borderRadius: '8px',
        border: '2px solid #3498db',
        color: '#3498db',
        '&:hover': {
          backgroundColor: '#f0f8ff',
          border: '2px solid #2980b9'
        }
      }}
    >
      No, conservar pedido
    </Button>
    <Button 
      onClick={cancelarPedidoYNotificar} 
      autoFocus 
      variant="contained"
      sx={{
        textTransform: 'none',
        fontSize: '1rem',
        padding: '8px 24px',
        borderRadius: '8px',
        backgroundColor: '#e74c3c',
        '&:hover': {
          backgroundColor: '#c0392b'
        }
      }}
    >
      Sí, cancelar pedido
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default Orders;