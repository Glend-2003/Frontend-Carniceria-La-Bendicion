import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VentaPedido.css";
import SideBar from "../SideBar/SideBar";
import FooterApp from "../Footer/FooterApp";
import useAuth from "../../hooks/useAuth";

const PedidosCompletadosApp = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const { usuario } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    cliente: "",
    metodoPago: ""
  });
  const [filteredPedidos, setFilteredPedidos] = useState([]);

  const [reportesData, setReportesData] = useState({
    total: { count: 0, sum: 0 },
    hoy: { count: 0, sum: 0 },
    semana: { count: 0, sum: 0 },
    mes: { count: 0, sum: 0 },
    anio: { count: 0, sum: 0 }
  });

  const generarCodigoPedido = (idPedido, fechaPedido) => {
    const fecha = new Date(fechaPedido);
    const año = fecha.getFullYear().toString().substring(2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); 
    const idFormateado = idPedido.toString().padStart(5, '0');

    return `PED-${año}${mes}-${idFormateado}`;
  };

  const formatearCodigoPedido = (idPedido, fechaPedido) => {
    if (!fechaPedido) return `PED-00000-${idPedido.toString().padStart(5, '0')}`;

    const fecha = new Date(fechaPedido);
    const año = fecha.getFullYear().toString().substring(2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const idFormateado = idPedido.toString().padStart(5, '0');

    return `PED-${año}${mes}-${idFormateado}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/pedido/Entregado");
        setPedidos(response.data);
        setFilteredPedidos(response.data);
        calcularEstadisticas(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calcularEstadisticas = (pedidosData) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    const stats = {
      total: { count: pedidosData.length, sum: 0 },
      hoy: { count: 0, sum: 0 },
      semana: { count: 0, sum: 0 },
      mes: { count: 0, sum: 0 },
      anio: { count: 0, sum: 0 }
    };

    pedidosData.forEach(pedido => {
      const fechaPedido = new Date(pedido.fechaPedido);
      const monto = pedido.montoTotalPedido || 0;

      stats.total.sum += monto;

      if (fechaPedido.toDateString() === hoy.toDateString()) {
        stats.hoy.count++;
        stats.hoy.sum += monto;
      }

      if (fechaPedido >= inicioSemana) {
        stats.semana.count++;
        stats.semana.sum += monto;
      }

      if (fechaPedido >= inicioMes) {
        stats.mes.count++;
        stats.mes.sum += monto;
      }

      if (fechaPedido >= inicioAnio) {
        stats.anio.count++;
        stats.anio.sum += monto;
      }
    });

    setReportesData(stats);
  };

  useEffect(() => {
    let filtered = [...pedidos];

    if (filters.startDate) {
      filtered = filtered.filter(pedido =>
        new Date(pedido.fechaPedido) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(pedido =>
        new Date(pedido.fechaPedido) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    if (filters.cliente) {
      filtered = filtered.filter(pedido => {
        const nombreCompleto = pedido.carrito?.usuario
          ? `${pedido.carrito.usuario.nombreUsuario} ${pedido.carrito.usuario.primerApellido} ${pedido.carrito.usuario.segundoApellido}`.toLowerCase()
          : '';
        return nombreCompleto.includes(filters.cliente.toLowerCase());
      });
    }

    setFilteredPedidos(filtered);
    setCurrentPage(1);
  }, [filters, pedidos]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const toggleExpandRow = (pedidoId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(pedidoId)) {
      newExpanded.delete(pedidoId);
    } else {
      newExpanded.add(pedidoId);
    }
    setExpandedRows(newExpanded);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      cliente: "",
      metodoPago: ""
    });
  };

  const generarReporte = (tipo) => {
    const reporte = {
      tipo,
      fecha: new Date().toLocaleDateString(),
      datos: reportesData[tipo],
      pedidos: obtenerPedidosParaReporte(tipo)
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    <html>
      <head>
        <title>Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #387623; padding-bottom: 20px; margin-bottom: 30px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #f9fcf5; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #387623; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #9fc45a; color: #103f1b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Pedidos Completados - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h1>
          <p>Generado el ${reporte.fecha}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total de Pedidos</h3>
            <div class="stat-value">${reporte.datos.count}</div>
          </div>
          <div class="stat-card">
            <h3>Monto Total</h3>
            <div class="stat-value">${formatCurrency(reporte.datos.sum)}</div>
          </div>
          <div class="stat-card">
            <h3>Promedio por Pedido</h3>
            <div class="stat-value">${formatCurrency(reporte.datos.count > 0 ? reporte.datos.sum / reporte.datos.count : 0)}</div>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${reporte.pedidos.map(pedido => `
              <tr>
                <td>${formatearCodigoPedido(pedido.idPedido, pedido.fechaPedido)}</td>
                <td>${pedido.carrito?.usuario
        ? `${pedido.carrito.usuario.nombreUsuario} ${pedido.carrito.usuario.primerApellido}`
        : 'N/A'}</td>
                <td>${formatDate(pedido.fechaPedido)}</td>
                <td>${formatCurrency(pedido.montoTotalPedido)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const obtenerPedidosParaReporte = (tipo) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    switch (tipo) {
      case 'hoy':
        return pedidos.filter(p => new Date(p.fechaPedido).toDateString() === hoy.toDateString());
      case 'semana':
        return pedidos.filter(p => new Date(p.fechaPedido) >= inicioSemana);
      case 'mes':
        return pedidos.filter(p => new Date(p.fechaPedido) >= inicioMes);
      case 'anio':
        return pedidos.filter(p => new Date(p.fechaPedido) >= inicioAnio);
      case 'total':
      default:
        return pedidos;
    }
  };

  if (loading) {
    return (
      <div className="vp-pedidos-completados-app">
        <div className="vp-page-container">
          <div className="vp-main-container">
            <div className="vp-loading-container">
              <div className="vp-loading-spinner"></div>
            </div>
          </div>
          <div className="vp-app-container">
            <SideBar usuario={usuario} />
          </div>
        </div>
        <FooterApp />
      </div>
    );
  }

  if (error) {
    return (
      <div className="vp-pedidos-completados-app">
        <div className="vp-page-container">
          <div className="vp-main-container">
            <div className="vp-error-message">{error}</div>
          </div>
          <div className="vp-app-container">
            <SideBar usuario={usuario} />
          </div>
        </div>
        <FooterApp />
      </div>
    );
  }

  return (
    <div className="vp-pedidos-completados-app">
      <div className="vp-page-container">
        <div className="vp-app-container">
          <SideBar usuario={usuario} />

          <div className="vp-main-container">
            <div className="vp-header-container">
              <h1 className="vp-header-title">Pedidos Completados</h1>
              <div className="vp-header-actions">
                <button
                  className="vp-refresh-button"
                  onClick={() => window.location.reload()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Actualizar
                </button>
              </div>
            </div>

            <div className="vp-stats-cards">
              <div className="vp-stat-card vp-total-card">
                <div className="vp-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="vp-stat-content">
                  <p className="vp-stat-title">Total</p>
                  <p className="vp-stat-value">{reportesData.total.count}</p>
                  <p className="vp-stat-amount">{formatCurrency(reportesData.total.sum)}</p>
                </div>
              </div>

              <div className="vp-stat-card vp-hoy-card">
                <div className="vp-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="vp-stat-content">
                  <p className="vp-stat-title">Hoy</p>
                  <p className="vp-stat-value">{reportesData.hoy.count}</p>
                  <p className="vp-stat-amount">{formatCurrency(reportesData.hoy.sum)}</p>
                </div>
              </div>

              <div className="vp-stat-card vp-semana-card">
                <div className="vp-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="vp-stat-content">
                  <p className="vp-stat-title">Esta Semana</p>
                  <p className="vp-stat-value">{reportesData.semana.count}</p>
                  <p className="vp-stat-amount">{formatCurrency(reportesData.semana.sum)}</p>
                </div>
              </div>

              <div className="vp-stat-card vp-mes-card">
                <div className="vp-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="vp-stat-content">
                  <p className="vp-stat-title">Este Mes</p>
                  <p className="vp-stat-value">{reportesData.mes.count}</p>
                  <p className="vp-stat-amount">{formatCurrency(reportesData.mes.sum)}</p>
                </div>
              </div>

              <div className="vp-stat-card vp-anio-card">
                <div className="vp-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="vp-stat-content">
                  <p className="vp-stat-title">Este Año</p>
                  <p className="vp-stat-value">{reportesData.anio.count}</p>
                  <p className="vp-stat-amount">{formatCurrency(reportesData.anio.sum)}</p>
                </div>
              </div>
            </div>

            <div className="vp-filter-reports-panel">
              <div className="vp-filter-panel">
                <div className="vp-filter-controls">
                  <div className="vp-search-filter-row">
                    <div className="vp-filter-select">
                      <label className="vp-filter-label">Cliente</label>
                      <input
                        type="text"
                        placeholder="Buscar por nombre del cliente..."
                        value={filters.cliente}
                        onChange={(e) => handleFilterChange('cliente', e.target.value)}
                        className="vp-filter-select-input"
                      />
                    </div>

                    <button
                      className="vp-filter-button"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Filtros Avanzados
                    </button>
                  </div>

                  {showAdvancedFilters && (
                    <div className="vp-advanced-filters">
                      <h3 className="vp-filter-title">Filtros Avanzados</h3>
                      <div className="vp-date-filters">
                        <div className="vp-date-filter-group">
                          <label className="vp-date-filter-label">Fecha Inicio</label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="vp-date-input"
                          />
                        </div>
                        <div className="vp-date-filter-group">
                          <label className="vp-date-filter-label">Fecha Fin</label>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="vp-date-input"
                          />
                        </div>
                      </div>
                      <div className="vp-filter-actions">
                        <button className="vp-clear-filter-button" onClick={clearFilters}>
                          Limpiar Filtros
                        </button>
                        <button className="vp-apply-filter-button" onClick={() => setShowAdvancedFilters(false)}>
                          Aplicar Filtros
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="vp-reports-panel">
                <h3 className="vp-reports-title">Generar Reportes</h3>
                <div className="vp-reports-actions">
                  <button
                    className="vp-report-button"
                    onClick={() => generarReporte('total')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 14h12v8H6v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Reporte Total
                  </button>
                  <button
                    className="vp-report-button"
                    onClick={() => generarReporte('hoy')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Reporte Diario
                  </button>
                  <button
                    className="vp-report-button"
                    onClick={() => generarReporte('semana')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Reporte Semanal
                  </button>
                  <button
                    className="vp-report-button"
                    onClick={() => generarReporte('mes')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Reporte Mensual
                  </button>
                  <button
                    className="vp-report-button"
                    onClick={() => generarReporte('anio')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Reporte Anual
                  </button>
                </div>
              </div>
            </div>

            <div className="vp-pedidos-container">
              {filteredPedidos.length === 0 ? (
                <div className="vp-no-results">
                  No se encontraron pedidos completados
                </div>
              ) : (
                <>
                  <table className="vp-pedidos-table">
                    <thead>
                      <tr>
                        <th className="vp-table-header">Código</th>
                        <th className="vp-table-header">Cliente</th>
                        <th className="vp-table-header">Fecha</th>
                        <th className="vp-table-header">Método de Pago</th>
                        <th className="vp-table-header">Total</th>
                        <th className="vp-table-header">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((pedido) => (
                        <React.Fragment key={pedido.idPedido}>
                          <tr
                            className={`vp-pedido-row ${expandedRows.has(pedido.idPedido) ? 'vp-expanded-row' : ''}`}
                            onClick={() => toggleExpandRow(pedido.idPedido)}
                          >
                            <td className="vp-pedido-cell" data-label="Código">
                              <span className="vp-pedido-id">{generarCodigoPedido(pedido.idPedido, pedido.fechaPedido)}</span>
                            </td>
                            <td className="vp-pedido-cell" data-label="Cliente">
                              <span className="vp-pedido-cliente">
                                {pedido.carrito?.usuario
                                  ? `${pedido.carrito.usuario.nombreUsuario} ${pedido.carrito.usuario.primerApellido}`
                                  : 'N/A'}
                              </span>
                            </td>
                            <td className="vp-pedido-cell" data-label="Fecha">
                              <span className="vp-pedido-fecha">{formatDate(pedido.fechaPedido)}</span>
                            </td>
                            <td className="vp-pedido-cell" data-label="Método Pago">
                              <span className="vp-pedido-metodo-pago">Efectivo</span>
                            </td>
                            <td className="vp-pedido-cell" data-label="Total">
                              <span className="vp-pedido-total">{formatCurrency(pedido.montoTotalPedido)}</span>
                            </td>
                            <td className="vp-pedido-cell" data-label="Acciones">
                              <div className="vp-pedido-actions">
                                <div className="vp-actions-container">
                                  <button
                                    className="vp-view-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPedido(pedido);
                                    }}
                                  >
                                    Ver detalles
                                  </button>
                                  <span
                                    className={`vp-expand-icon ${expandedRows.has(pedido.idPedido) ? 'rotated' : ''}`}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {expandedRows.has(pedido.idPedido) && (
                            <tr className="vp-expanded-content">
                              <td colSpan="6">
                                <div className="vp-expanded-grid">
                                  <div className="vp-expanded-card">
                                    <h4 className="vp-expanded-card-title">Información del Cliente</h4>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Cédula:</span>
                                      <span className="vp-info-value">{pedido.carrito?.usuario?.cedulaUsuario || 'N/A'}</span>
                                    </div>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Teléfono:</span>
                                      <span className="vp-info-value">{pedido.carrito?.usuario?.telefonoUsuario || 'N/A'}</span>
                                    </div>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Correo:</span>
                                      <span className="vp-info-value">{pedido.carrito?.usuario?.correoUsuario || 'N/A'}</span>
                                    </div>
                                  </div>

                                  <div className="vp-expanded-card">
                                    <h4 className="vp-expanded-card-title">Información del Pedido</h4>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Estado:</span>
                                      <span className="vp-info-value">Entregado</span>
                                    </div>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Fecha Entrega:</span>
                                      <span className="vp-info-value vp-fecha-entrega">{formatDate(pedido.fechaPedido)}</span>
                                    </div>
                                    <div className="vp-info-row">
                                      <span className="vp-info-label">Monto Total:</span>
                                      <span className="vp-info-value vp-monto-total">{formatCurrency(pedido.montoTotalPedido)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  <div className="vp-pagination-container">
                    <div className="vp-pagination-info">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredPedidos.length)} de {filteredPedidos.length} pedidos
                    </div>
                    <div className="vp-pagination-buttons">
                      <button
                        className={`vp-pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                      <button
                        className={`vp-pagination-btn ${currentPage === totalPages || filteredPedidos.length <= itemsPerPage ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || filteredPedidos.length <= itemsPerPage}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <FooterApp />
      </div>

      {selectedPedido && (
        <div className="vp-pedido-details-modal">
          <div className="vp-pedido-details-content">
            <div className="vp-modal-header">
              <h2 className="vp-modal-title">Detalles del Pedido {generarCodigoPedido(selectedPedido.idPedido, selectedPedido.fechaPedido)}</h2>

              <button className="vp-close-btn" onClick={() => setSelectedPedido(null)}>×</button>
            </div>
            <div className="vp-modal-body">
              <div className="vp-modal-sections">
                <div className="vp-modal-section">
                  <div className="vp-info-card">
                    <div className="vp-info-header">
                      <h3 className="vp-info-title">Información del Cliente</h3>
                    </div>
                    <div className="vp-info-body">
                      <div className="vp-info-row">
                        <span className="vp-info-label">Nombre:</span>
                        <span className="vp-info-value">
                          {selectedPedido.carrito?.usuario
                            ? `${selectedPedido.carrito.usuario.nombreUsuario} ${selectedPedido.carrito.usuario.primerApellido} ${selectedPedido.carrito.usuario.segundoApellido}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Cédula:</span>
                        <span className="vp-info-value">{selectedPedido.carrito?.usuario?.cedulaUsuario || 'N/A'}</span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Teléfono:</span>
                        <span className="vp-info-value">{selectedPedido.carrito?.usuario?.telefonoUsuario || 'N/A'}</span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Correo:</span>
                        <span className="vp-info-value">{selectedPedido.carrito?.usuario?.correoUsuario || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vp-modal-section">
                  <div className="vp-info-card">
                    <div className="vp-info-header">
                      <h3 className="vp-info-title">Información del Pedido</h3>
                    </div>
                    <div className="vp-info-body">
                      <div className="vp-info-row">
                        <span className="vp-info-label">Fecha:</span>
                        <span className="vp-info-value">{formatDate(selectedPedido.fechaPedido)}</span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Estado:</span>
                        <span className="vp-info-value">Entregado</span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Método Pago:</span>
                        <span className="vp-info-value">Efectivo</span>
                      </div>
                      <div className="vp-info-row">
                        <span className="vp-info-label">Total:</span>
                        <span className="vp-info-value vp-monto-total">{formatCurrency(selectedPedido.montoTotalPedido)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vp-modal-section vp-modal-section-full-width">
                  <div className="vp-productos-card">
                    <div className="vp-info-header">
                      <h3 className="vp-info-title">Productos <span className="vp-product-count">({selectedPedido.carrito?.productos?.length || 0})</span></h3>
                    </div>
                    <div className="vp-info-body">
                      {selectedPedido.carrito?.productos?.length > 0 ? (
                        <div className="vp-products-grid">
                          {selectedPedido.carrito.productos.map((producto, index) => (
                            <div className="vp-product-item-card" key={index}>
                              <div className="vp-product-item-image">
                                {producto.imgProducto ? (
                                  <img
                                    src={producto.imgProducto}
                                    alt={producto.nombreProducto}
                                    className="vp-product-img"
                                  />
                                ) : (
                                  <div className="vp-no-image-product">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="vp-product-item-details">
                                <h4 className="vp-product-item-name">{producto.nombreProducto}</h4>

                                {producto.descripcionProducto && (
                                  <p className="vp-product-item-description">{producto.descripcionProducto}</p>
                                )}

                                <div className="vp-product-item-meta">
                                  {producto.codigoProducto && (
                                    <div className="vp-product-item-code">
                                      <span className="vp-meta-label">Código:</span> {producto.codigoProducto}
                                    </div>
                                  )}

                                  <div className="vp-product-item-quantity">
                                    <span className="vp-meta-label">Cantidad:</span> {producto.cantidadProducto} {producto.tipoPesoProducto || 'unidades'}
                                  </div>

                                  {producto.idCategoria && (
                                    <div className="vp-product-item-category">
                                      <span className="vp-meta-label">Categoría:</span> {producto.idCategoria}
                                    </div>
                                  )}
                                </div>

                                <div className="vp-product-item-price">
                  
                                  ₡{producto.montoPrecioProducto ? producto.montoPrecioProducto.toLocaleString() : '0'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="vp-no-products-message">No hay productos en este pedido</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosCompletadosApp;