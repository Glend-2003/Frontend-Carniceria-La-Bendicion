import React, { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert as MuiAlert } from "@mui/material";
import "./PedidosApp.css";
import SideBar from "../SideBar/SideBar";
import FooterApp from "../Footer/FooterApp";
import useAuth from "../../hooks/useAuth";
import NotificacionPedido from "../Notificacion/NotificacionPedido";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  Edit,
  X,
  DollarSign
} from 'lucide-react';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PedidosApp = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const [filterStatus, setFilterStatus] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [tiposPago, setTiposPago] = useState([]);

  const [expandedPedido, setExpandedPedido] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { usuario } = useAuth();

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const generarCodigoPedido = (idPedido, fechaPedido) => {
    const fecha = new Date(fechaPedido);
    const año = fecha.getFullYear().toString().substring(2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');

    const idFormateado = idPedido.toString().padStart(5, '0');

    return `PED-${año}${mes}-${idFormateado}`;
  };

  useEffect(() => {
    fetchPedidos();
    fetchTiposPago();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filterStatus, pedidos, filtroFechaInicio, filtroFechaFin]);

  const [allPedidos, setAllPedidos] = useState([]);
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get("http://localhost:8080/pedido/");

      const sortedPedidos = response.data.sort((a, b) =>
        new Date(b.fechaPedido) - new Date(a.fechaPedido)
      );

      setAllPedidos(sortedPedidos);

      const pedidosActivos = sortedPedidos.filter(pedido =>
        pedido.estadoEntregaPedido !== "Entregado"
      );

      setPedidos(pedidosActivos);
      setFilteredPedidos(pedidosActivos);
      setLoading(false);
      showSnackbar("Pedidos actualizados correctamente", "success");
    } catch (err) {
      setError(
        "Error al cargar los pedidos. Por favor, intente de nuevo más tarde."
      );
      setLoading(false);
      console.error("Error fetching pedidos:", err);
      showSnackbar("Error al cargar los pedidos", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTiposPago = async () => {
    try {
      const response = await axios.get("http://localhost:8080/tipopago/");
      setTiposPago(response.data);
    } catch (err) {
      console.error("Error fetching tipos de pago:", err);
    }
  };

  const aplicarFiltros = () => {
    let result = [...pedidos];
    const filtrandoEntregados = filterStatus === "Entregado";

    if (filterStatus !== "todos") {
      if (filterStatus === "activo") {
        result = result.filter((pedido) => pedido.estadoPedido);
      } else if (filterStatus === "inactivo") {
        result = result.filter((pedido) => !pedido.estadoPedido);
      } else {
        result = result.filter(
          (pedido) => pedido.estadoEntregaPedido === filterStatus
        );
      }
    } else if (!filtrandoEntregados) {
      result = result.filter(pedido => pedido.estadoEntregaPedido !== "Entregado");
    }

    if (filtroFechaInicio && filtroFechaFin) {
      const fechaInicio = new Date(filtroFechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(filtroFechaFin);
      fechaFin.setHours(23, 59, 59, 999);

      result = result.filter((pedido) => {
        const fechaPedido = new Date(pedido.fechaPedido);
        return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
      });
    }

    setFilteredPedidos(result);
    setCurrentPage(1);
  };

  const aplicarFiltrosAvanzados = async () => {
    try {
      setLoading(true);

      let url = `http://localhost:8080/pedido/filtrar?idUsuario=0`;

      const filtrandoEntregados = filterStatus === "Entregado";

      if (filterStatus !== "todos" && filterStatus !== "activo" && filterStatus !== "inactivo") {
        url += `&estadoEntrega=${encodeURIComponent(filterStatus)}`;
      }

      if (filtroFechaInicio) {
        const fechaInicio = new Date(filtroFechaInicio);
        fechaInicio.setHours(0, 0, 0);
        url += `&fechaInicio=${encodeURIComponent(fechaInicio.toISOString().replace('T', ' ').substring(0, 19))}`;
      }

      if (filtroFechaFin) {
        const fechaFin = new Date(filtroFechaFin);
        fechaFin.setHours(23, 59, 59);
        url += `&fechaFin=${encodeURIComponent(fechaFin.toISOString().replace('T', ' ').substring(0, 19))}`;
      }

      const response = await axios.get(url);

      const sortedPedidos = response.data.sort((a, b) =>
        new Date(b.fechaPedido) - new Date(a.fechaPedido)
      );

      let filteredResults = sortedPedidos;
      if (!filtrandoEntregados) {
        filteredResults = sortedPedidos.filter(pedido =>
          pedido.estadoEntregaPedido !== "Entregado"
        );
      }

      setFilteredPedidos(filteredResults);
      showSnackbar("Filtros aplicados correctamente", "success");
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
      showSnackbar("Error al aplicar filtros", "error");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "idTipoPago") {
      const tipoPagoSeleccionado = tiposPago.find(
        (tp) => tp.idTipoPago === parseInt(value, 10)
      );

      setEditFormData({
        ...editFormData,
        idTipoPago: parseInt(value, 10),
        tipoPago: tipoPagoSeleccionado,
      });
    } else {
      const newValue =
        type === "checkbox"
          ? checked
          : name === "montoTotalPedido"
            ? parseFloat(value)
            : value;

      setEditFormData({
        ...editFormData,
        [name]: newValue,
      });
    }
  };

  const handleEditPedido = () => {
    if (!selectedPedido) return;

    setEditFormData({
      idPedido: selectedPedido.idPedido,
      montoTotalPedido: selectedPedido.montoTotalPedido,
      fechaPedido: formatDateForInput(selectedPedido.fechaPedido),
      estadoPedido: selectedPedido.estadoPedido,
      estadoEntregaPedido: selectedPedido.estadoEntregaPedido,
      carrito: selectedPedido.carrito,
      tipoPago: selectedPedido.tipoPago,
      idTipoPago: selectedPedido.tipoPago?.idTipoPago,
    });

    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditFormData(null);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8080/pedido/actualizar`,
        editFormData
      );

      const updatedPedidos = pedidos.map((pedido) => {
        if (pedido.idPedido === editFormData.idPedido) {
          const updatedPedido = {
            ...pedido,
            montoTotalPedido: editFormData.montoTotalPedido,
            fechaPedido: new Date(editFormData.fechaPedido).toISOString(),
            estadoPedido: editFormData.estadoPedido,
            estadoEntregaPedido: editFormData.estadoEntregaPedido,
            tipoPago: editFormData.tipoPago,
          };

          return updatedPedido;
        }
        return pedido;
      });

      setPedidos(updatedPedidos);
      setSelectedPedido(
        updatedPedidos.find((p) => p.idPedido === editFormData.idPedido)
      );
      setEditMode(false);
      setEditFormData(null);

      showSnackbar("Pedido actualizado exitosamente", "success");
    } catch (err) {
      console.error("Error updating pedido:", err);
      showSnackbar("Error al actualizar el pedido", "error");
    }
  };

  const handleChangeEstadoEntrega = async (pedidoId, nuevoEstado) => {
    if (nuevoEstado === 'Cancelado' &&
      !window.confirm('¿Está seguro que desea cancelar este pedido?')) {
      return;
    }

    if (nuevoEstado === 'Entregado' &&
      !window.confirm('¿Está seguro que desea marcar este pedido como entregado? El pedido ya no aparecerá en esta pantalla.')) {
      return;
    }

    setUpdatingStatus(pedidoId);
    try {
      const pedidoActual = pedidos.find(p => p.idPedido === pedidoId);
      const correoCliente = pedidoActual?.carrito?.usuario?.correoUsuario || '';

      await axios.put(
        `http://localhost:8080/pedido/actualizarEstadoPedido/${pedidoId}`,
        null,
        {
          params: {
            correoCliente: correoCliente,
            nuevoEstado: nuevoEstado
          }
        }
      );

      if (nuevoEstado === "Entregado") {
        const updatedPedidos = pedidos.filter(pedido => pedido.idPedido !== pedidoId);
        setPedidos(updatedPedidos);

        const updatedFiltered = filteredPedidos.filter(pedido => pedido.idPedido !== pedidoId);
        setFilteredPedidos(updatedFiltered);

        if (selectedPedido && selectedPedido.idPedido === pedidoId) {
          setSelectedPedido(null);
        }
        if (expandedPedido === pedidoId) {
          setExpandedPedido(null);
        }

        showSnackbar("Pedido marcado como entregado y movido a historial", "success");
      } else {
        const updatedPedidos = pedidos.map((pedido) => {
          if (pedido.idPedido === pedidoId) {
            return { ...pedido, estadoEntregaPedido: nuevoEstado };
          }
          return pedido;
        });

        setPedidos(updatedPedidos);

        const updatedFiltered = filteredPedidos.map((pedido) => {
          if (pedido.idPedido === pedidoId) {
            return { ...pedido, estadoEntregaPedido: nuevoEstado };
          }
          return pedido;
        });

        setFilteredPedidos(updatedFiltered);

        if (selectedPedido && selectedPedido.idPedido === pedidoId) {
          setSelectedPedido({
            ...selectedPedido,
            estadoEntregaPedido: nuevoEstado,
          });
        }

        showSnackbar(`Estado de entrega actualizado a: ${nuevoEstado}`, "success");
      }
    } catch (err) {
      console.error("Error updating pedido status:", err);
      showSnackbar("Error al actualizar el estado de entrega", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleSelectPedido = (pedido) => {
    setSelectedPedido(pedido);
    setEditMode(false);
    setEditFormData(null);
  };

  const handleCloseDetails = () => {
    setSelectedPedido(null);
    setEditMode(false);
    setEditFormData(null);
  };

  const limpiarFiltros = () => {
    setFilterStatus('todos');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFilteredPedidos(pedidos);
  };

  const toggleExpandPedido = (idPedido) => {
    if (expandedPedido === idPedido) {
      setExpandedPedido(null);
    } else {
      setExpandedPedido(idPedido);
    }
  };

  return (
    <div className="page-container">
      <div className="main-container ">
        <SideBar usuario={usuario} />

        <div className="main-content">
          <div className="header-container">
            <h1>Administración de Pedidos</h1>
            <div className="header-actions">
              <button
                onClick={fetchPedidos}
                className="refresh-button"
                disabled={refreshing}
              >
                {refreshing ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Actualizar
                  </>
                )}
              </button>
              <NotificacionPedido />
            </div>
          </div>

          <div className="main-panel">
            <div className="stats-cards">
              <div className="stat-card total-card">
                <div className="stat-icon">
                  <DollarSign size={20} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">Total de Pedidos</h3>
                  <p className="stat-value">{allPedidos.length}</p>
                </div>
              </div>

              <div className="stat-card pending-card">
                <div className="stat-icon">
                  <Clock size={20} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">Pendientes</h3>
                  <p className="stat-value">
                    {allPedidos.filter(p => p.estadoEntregaPedido === "Pendiente").length}
                  </p>
                </div>
              </div>

              <div className="stat-card process-card">
                <div className="stat-icon">
                  <Package size={20} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">En Proceso</h3>
                  <p className="stat-value">
                    {allPedidos.filter(p => p.estadoEntregaPedido === "En Proceso").length}
                  </p>
                </div>
              </div>

              <div className="stat-card ready-card">
                <div className="stat-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">Listos</h3>
                  <p className="stat-value">
                    {allPedidos.filter(p => p.estadoEntregaPedido === "Listo").length}
                  </p>
                </div>
              </div>

              <div className="stat-card delivered-card">
                <div className="stat-icon">
                  <Truck size={20} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">Entregados</h3>
                  <p className="stat-value">
                    {allPedidos.filter(p => p.estadoEntregaPedido === "Entregado").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="filter-panel">
              <div className="filter-controls">
                <div className="search-filter-row">
                  <div className="filter-select">
                    <label htmlFor="status-filter">Estado</label>
                    <select
                      id="status-filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="filter-select-input"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Listo">Listo</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="filter-button"
                  >
                    <Filter size={18} />
                    {mostrarFiltros ? 'Ocultar filtros' : 'Filtros avanzados'}
                  </button>
                </div>

                {mostrarFiltros && (
                  <div className="advanced-filters">
                    <h3 className="filter-title">Filtrar por fecha</h3>
                    <div className="date-filters">
                      <div className="date-filter-group">
                        <label className="date-filter-label">Fecha desde</label>
                        <input
                          type="date"
                          value={filtroFechaInicio}
                          onChange={(e) => setFiltroFechaInicio(e.target.value)}
                          className="date-input"
                        />
                      </div>
                      <div className="date-filter-group">
                        <label className="date-filter-label">Fecha hasta</label>
                        <input
                          type="date"
                          value={filtroFechaFin}
                          onChange={(e) => setFiltroFechaFin(e.target.value)}
                          className="date-input"
                        />
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button
                        onClick={limpiarFiltros}
                        className="clear-filter-button"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={aplicarFiltrosAvanzados}
                        className="apply-filter-button"
                      >
                        Aplicar filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading && !refreshing ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="no-results">
                No se encontraron pedidos con los filtros seleccionados
              </div>
            ) : (
              <div>
                <div className="pedidos-container">
                  <table className="pedidos-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((pedido) => (
                        <React.Fragment key={pedido.idPedido}>
                          <tr
                            className={`pedido-row ${!pedido.estadoPedido ? 'inactive-row' : ''}`}
                            onClick={() => toggleExpandPedido(pedido.idPedido)}
                          >
                            <td className="pedido-id">
                              {generarCodigoPedido(pedido.idPedido, pedido.fechaPedido)}
                            </td>
                            <td className="pedido-client">
                              {pedido.carrito?.usuario?.nombreUsuario
                                ? `${pedido.carrito.usuario.nombreUsuario} ${pedido.carrito.usuario.primerApellido}`
                                : 'N/A'}
                            </td>
                            <td className="pedido-date">
                              {formatDate(pedido.fechaPedido)}
                            </td>
                            <td className="pedido-status">
                              <span className={`estado-badge estado-${pedido.estadoEntregaPedido.toLowerCase().replace(' ', '-')}`}>
                                {pedido.estadoEntregaPedido === "Pendiente" && <Clock size={16} />}
                                {pedido.estadoEntregaPedido === "En Proceso" && <Package size={16} />}
                                {pedido.estadoEntregaPedido === "Listo" && <CheckCircle size={16} />}
                                {pedido.estadoEntregaPedido === "Entregado" && <Truck size={16} />}
                                {pedido.estadoEntregaPedido === "Cancelado" && <AlertTriangle size={16} />}
                                {pedido.estadoEntregaPedido}
                              </span>
                            </td>
                            <td className="pedido-total">
                              ₡{pedido.montoTotalPedido ? pedido.montoTotalPedido.toLocaleString() : '0'}
                            </td>
                            <td className="pedido-actions">
                              <div className="actions-container">
                                <button
                                  className="view-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPedido(pedido);
                                  }}
                                >
                                  Ver detalles
                                </button>
                                {expandedPedido === pedido.idPedido ? (
                                  <ChevronUp size={20} className="expand-icon" />
                                ) : (
                                  <ChevronDown size={20} className="expand-icon" />
                                )}
                              </div>
                            </td>
                          </tr>

                          {expandedPedido === pedido.idPedido && (
                            <tr className="expanded-row">
                              <td colSpan="6" className="expanded-content">
                                <div className="expanded-grid">
                                  <div className="expanded-card client-info">
                                    <h4 className="expanded-card-title">
                                      Información del cliente
                                    </h4>
                                    <p><strong>Nombre:</strong> {pedido.carrito?.usuario?.nombreUsuario} {pedido.carrito?.usuario?.primerApellido} {pedido.carrito?.usuario?.segundoApellido}</p>
                                    {pedido.carrito?.usuario?.cedulaUsuario && (
                                      <p><strong>Cédula:</strong> {pedido.carrito.usuario.cedulaUsuario}</p>
                                    )}
                                    <p><strong>Correo:</strong> {pedido.carrito?.usuario?.correoUsuario}</p>
                                    {pedido.carrito?.usuario?.telefonoUsuario && (
                                      <p><strong>Teléfono:</strong> {pedido.carrito.usuario.telefonoUsuario}</p>
                                    )}
                                  </div>

                                  <div className="expanded-card order-info">
                                    <h4 className="expanded-card-title">
                                      Información del pedido
                                    </h4>
                                    <p><strong>Fecha:</strong> {formatDate(pedido.fechaPedido)}</p>
                                    <p><strong>Método de pago:</strong> {pedido.tipoPago?.descripcionTipoPago || 'No especificado'}</p>
                                    <p><strong>Total:</strong> ₡{pedido.montoTotalPedido ? pedido.montoTotalPedido.toLocaleString() : '0'}</p>
                                    <p><strong>Estado:</strong> {pedido.estadoEntregaPedido}</p>
                                  </div>

                                  <div className="expanded-card status-change">
                                    <h4 className="expanded-card-title">
                                      Cambiar estado
                                    </h4>
                                    <div className="status-buttons">
                                      {['Pendiente', 'En Proceso', 'Listo', 'Entregado', 'Cancelado'].map(estado => (
                                        <button
                                          key={estado}
                                          onClick={() => handleChangeEstadoEntrega(pedido.idPedido, estado)}
                                          disabled={updatingStatus === pedido.idPedido || pedido.estadoEntregaPedido === estado}
                                          className={`status-btn ${pedido.estadoEntregaPedido === estado ? 'selected' : ''} ${estado === 'Cancelado' ? 'cancel-btn' : ''}`}
                                        >
                                          {updatingStatus === pedido.idPedido ? (
                                            <span className="loading-spinner-small"></span>
                                          ) : estado}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="status-note">
                                      Al cambiar el estado se notificará automáticamente al cliente por correo electrónico
                                    </div>
                                  </div>
                                </div>

                                <div className="expanded-card products-list">
                                  <h4 className="expanded-card-title">
                                    Productos ({pedido.carrito?.productos?.length || 0})
                                  </h4>
                                  {pedido.carrito?.productos && pedido.carrito.productos.length > 0 ? (
                                    <div className="product-grid">
                                      {pedido.carrito.productos.map((producto, idx) => (
                                        <div key={idx} className="product-card">
                                          <div className="product-image">
                                            {producto.imgProducto ? (
                                              <img
                                                src={producto.imgProducto}
                                                alt={producto.nombreProducto}
                                              />
                                            ) : (
                                              <div className="no-image">
                                                Sin imagen
                                              </div>
                                            )}
                                          </div>
                                          <div className="product-details">
                                            <h5 className="product-name">
                                              {producto.nombreProducto}
                                            </h5>
                                            <p className="product-quantity">
                                              {producto.cantidadProducto} {producto.tipoPesoProducto || 'unidades'}
                                            </p>
                                            <p className="product-price">
                                              ₡{producto.montoPrecioProducto ? producto.montoPrecioProducto.toLocaleString() : '0'}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="no-products">
                                      No hay productos en este pedido
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPedidos.length > itemsPerPage && (
                  <div className="pagination-container">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                      &laquo; Anterior
                    </button>

                    <div className="pagination-info">
                      Página {currentPage} de {totalPages}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    >
                      Siguiente &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedPedido && (
            <div className="pedido-details-modal">
              <div className="pedido-details-content">
                <div className="modal-header">
                  <h2>Pedido {generarCodigoPedido(selectedPedido.idPedido, selectedPedido.fechaPedido)}</h2>
                  <button className="close-btn" onClick={handleCloseDetails}>
                    <X size={24} />
                  </button>
                </div>

                <div className="modal-body">
                  {!editMode ? (
                    <>
                      <div className="modal-sections">
                        <div className="modal-section">
                          <div className="info-card">
                            <div className="info-header">
                              <h3>Información del Pedido</h3>
                            </div>
                            <div className="info-body">
                              <div className="info-row">
                                <span className="info-label">Fecha:</span>
                                <span className="info-value">{formatDate(selectedPedido.fechaPedido)}</span>
                              </div>

                              <div className="info-row">
                                <span className="info-label">Estado:</span>
                                <span className={`active-status ${selectedPedido.estadoPedido ? 'active' : 'inactive'}`}>
                                  {selectedPedido.estadoPedido ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>

                              <div className="info-row">
                                <span className="info-label">Estado de Entrega:</span>
                                <span className={`estado-badge estado-${selectedPedido.estadoEntregaPedido.toLowerCase().replace(' ', '-')}`}>
                                  {selectedPedido.estadoEntregaPedido === "Pendiente" && <Clock size={16} />}
                                  {selectedPedido.estadoEntregaPedido === "En Proceso" && <Package size={16} />}
                                  {selectedPedido.estadoEntregaPedido === "Listo" && <CheckCircle size={16} />}
                                  {selectedPedido.estadoEntregaPedido === "Entregado" && <Truck size={16} />}
                                  {selectedPedido.estadoEntregaPedido === "Cancelado" && <AlertTriangle size={16} />}
                                  {selectedPedido.estadoEntregaPedido}
                                </span>
                              </div>

                              <div className="info-row">
                                <span className="info-label">Método de Pago:</span>
                                <span className="info-value">{selectedPedido.tipoPago ? selectedPedido.tipoPago.descripcionTipoPago : 'N/A'}</span>
                              </div>

                              <div className="info-row">
                                <span className="info-label">Monto Total:</span>
                                <span className="info-value monto-total">₡{selectedPedido.montoTotalPedido ? selectedPedido.montoTotalPedido.toLocaleString() : '0'}</span>
                              </div>
                            </div>
                          </div>

                          {selectedPedido.carrito && selectedPedido.carrito.usuario && (
                            <div className="info-card">
                              <div className="info-header">
                                <h3>Información del Cliente</h3>
                              </div>
                              <div className="info-body">
                                <div className="info-row">
                                  <span className="info-label">Nombre:</span>
                                  <span className="info-value">{selectedPedido.carrito.usuario.nombreUsuario} {selectedPedido.carrito.usuario.primerApellido} {selectedPedido.carrito.usuario.segundoApellido}</span>
                                </div>

                                {selectedPedido.carrito.usuario.cedulaUsuario && (
                                  <div className="info-row">
                                    <span className="info-label">Cédula:</span>
                                    <span className="info-value">{selectedPedido.carrito.usuario.cedulaUsuario}</span>
                                  </div>
                                )}

                                <div className="info-row">
                                  <span className="info-label">Correo:</span>
                                  <span className="info-value">{selectedPedido.carrito.usuario.correoUsuario}</span>
                                </div>

                                {selectedPedido.carrito.usuario.telefonoUsuario && (
                                  <div className="info-row">
                                    <span className="info-label">Teléfono:</span>
                                    <span className="info-value">{selectedPedido.carrito.usuario.telefonoUsuario}</span>
                                  </div>
                                )}

                                {selectedPedido.carrito.usuario.direccion && (
                                  <div className="info-row">
                                    <span className="info-label">Dirección:</span>
                                    <span className="info-value">{selectedPedido.carrito.usuario.direccion.detalleExactoDireccion}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="modal-section">
                          <div className="cambiar-estado-card">
                            <div className="info-header">
                              <h3>Cambiar Estado de Entrega</h3>
                            </div>
                            <div className="status-buttons-container">
                              {['Pendiente', 'En Proceso', 'Listo', 'Entregado', 'Cancelado'].map(estado => (
                                <button
                                  key={estado}
                                  onClick={() => handleChangeEstadoEntrega(selectedPedido.idPedido, estado)}
                                  disabled={updatingStatus === selectedPedido.idPedido || selectedPedido.estadoEntregaPedido === estado}
                                  className={`status-btn ${selectedPedido.estadoEntregaPedido === estado ? 'selected' : ''} ${estado === 'Cancelado' ? 'cancel-btn' : ''}`}
                                >
                                  {updatingStatus === selectedPedido.idPedido ? (
                                    <span className="loading-spinner-small"></span>
                                  ) : (
                                    <>
                                      {estado === "Pendiente" && <Clock size={16} />}
                                      {estado === "En Proceso" && <Package size={16} />}
                                      {estado === "Listo" && <CheckCircle size={16} />}
                                      {estado === "Entregado" && <Truck size={16} />}
                                      {estado === "Cancelado" && <AlertTriangle size={16} />}
                                      {estado}
                                    </>
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="status-note">
                              <p>Al cambiar el estado se notificará automáticamente al cliente por correo electrónico</p>
                            </div>
                          </div>
                        </div>

                        <div className="modal-section full-width">
                          <div className="productos-card">
                            <div className="info-header product-header">
                              <h3>Productos</h3>
                              <span className="product-count">({selectedPedido.carrito?.productos?.length || 0})</span>
                            </div>
                            {selectedPedido.carrito && selectedPedido.carrito.productos && selectedPedido.carrito.productos.length > 0 ? (
                              <div className="products-grid">
                                {selectedPedido.carrito.productos.map((producto, index) => (
                                  <div key={index} className="product-item-card">
                                    <div className="product-item-image">
                                      {producto.imgProducto ? (
                                        <img
                                          src={producto.imgProducto}
                                          alt={producto.nombreProducto}
                                        />
                                      ) : (
                                        <div className="no-image-product">
                                          <Package size={40} />
                                        </div>
                                      )}
                                    </div>

                                    <div className="product-item-details">
                                      <h4 className="product-item-name">{producto.nombreProducto}</h4>

                                      {producto.descripcionProducto && (
                                        <p className="product-item-description">{producto.descripcionProducto}</p>
                                      )}

                                      <div className="product-item-meta">
                                        {producto.codigoProducto && (
                                          <div className="product-item-code">
                                            <span className="meta-label">Código:</span> {producto.codigoProducto}
                                          </div>
                                        )}

                                        <div className="product-item-quantity">
                                          <span className="meta-label">Cantidad:</span> {producto.cantidadProducto} {producto.tipoPesoProducto || 'unidades'}
                                        </div>

                                        {producto.idCategoria && (
                                          <div className="product-item-category">
                                            <span className="meta-label">Categoría:</span> {producto.idCategoria}
                                          </div>
                                        )}
                                      </div>

                                      <div className="product-item-price">

                                        ₡{producto.montoPrecioProducto ? producto.montoPrecioProducto.toLocaleString() : '0'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-products-message">
                                No hay productos en este pedido
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="edit-button-container">
                        <button
                          onClick={handleEditPedido}
                          className="edit-pedido-btn"
                        >
                          <Edit size={18} />
                          Editar Pedido
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmitEdit} className="edit-form">
                      <div className="form-section">
                        <h3>Información Básica</h3>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Monto Total (₡)</label>
                            <input
                              type="number"
                              name="montoTotalPedido"
                              value={editFormData.montoTotalPedido}
                              onChange={handleEditFormChange}
                              required
                              step="0.01"
                              className="form-control"
                            />
                          </div>

                          <div className="form-group">
                            <label>Fecha del Pedido</label>
                            <input
                              type="datetime-local"
                              name="fechaPedido"
                              value={editFormData.fechaPedido}
                              onChange={handleEditFormChange}
                              required
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group checkbox-group">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                name="estadoPedido"
                                checked={editFormData.estadoPedido}
                                onChange={handleEditFormChange}
                              />
                              <span className="checkbox-text">Pedido Activo</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-section">
                        <h3>Estado y Método de Pago</h3>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Estado de Entrega</label>
                            <select
                              name="estadoEntregaPedido"
                              value={editFormData.estadoEntregaPedido}
                              onChange={handleEditFormChange}
                              required
                              className="form-control"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En Proceso">En Proceso</option>
                              <option value="Listo">Listo</option>
                              <option value="Entregado">Entregado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Método de Pago</label>
                            <select
                              name="idTipoPago"
                              value={editFormData.idTipoPago || ""}
                              onChange={handleEditFormChange}
                              required
                              className="form-control"
                            >
                              <option value="">Seleccione un método de pago</option>
                              {tiposPago.map((tipo) => (
                                <option
                                  key={tipo.idTipoPago}
                                  value={tipo.idTipoPago}
                                >
                                  {tipo.descripcionTipoPago}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="save-btn">
                          Guardar Cambios
                        </button>

                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterApp />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PedidosApp;