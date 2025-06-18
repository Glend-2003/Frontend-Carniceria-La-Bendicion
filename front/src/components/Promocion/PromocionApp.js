import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faExclamationTriangle, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import SideBar from "../SideBar/SideBar";
import useAuth from "../../hooks/useAuth";
import { Button, Modal } from "react-bootstrap";
import FooterApp from '../Footer/FooterApp';
import "./Promocion.css";
import PaginacionApp from "../Paginacion/PaginacionApp";

const PromocionApp = () => {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [promocionEdit, setPromocionEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();
  const [search, setSearch] = useState("");
  const [descripcionPromocion, setDescripcionPromocion] = useState("");
  const [fechaInicioPromocion, setFechaInicioPromocion] = useState("");
  const [fechaFinPromocion, setFechaFinPromocion] = useState("");
  const [montoPromocion, setMontoPromocion] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [estadoPromocion, setEstadoPromocion] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    cargarPromociones();
    cargarProductos();
  }, []);


  useEffect(() => {
    if (showModal && promocionEdit && productos.length > 0) {
      console.log("Estado actual:");
      console.log("ID de producto seleccionado:", idProducto);
      console.log("Productos disponibles:", productos);

      const productoSeleccionado = productos.find(p => p.idProducto.toString() === idProducto);
      if (productoSeleccionado) {
        console.log("Producto seleccionado encontrado:", productoSeleccionado.nombreProducto);
      } else if (idProducto) {
        console.log("⚠️ ADVERTENCIA: ID de producto seleccionado no encontrado en la lista de productos");
      }
    }
  }, [showModal, promocionEdit, productos, idProducto]);

  const cargarPromociones = async () => {
    try {
      const response = await axios.get("http://localhost:8080/promocion/");
      console.log("Promociones recibidas del backend:", response.data);
      
      setPromociones(response.data);
    } catch (error) {
      console.error("Error al cargar promociones:", error);
      toast.error("Ocurrió un error al cargar las promociones");
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/producto/", {
        params: { estadoProducto: 1 }
      });
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Ocurrió un error al cargar los productos");
    }
  };

  const isPromocionVencida = (fechaFin) => {
    const fechaFinDate = new Date(fechaFin);

    fechaFinDate.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaFinDate < hoy;
  };

  const validarCamposPromocion = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(fechaInicioPromocion);
    const fechaFin = new Date(fechaFinPromocion);

    if (!fechaFinPromocion || isNaN(fechaFin)) {
      toast.error("La fecha de fin es inválida o está vacía");
      return false;
    }

    if (fechaInicio < hoy - 2) {
      toast.error("La fecha de inicio no puede ser menor a la actual");
      return false;
    }

    if (fechaFin < fechaInicio) {
      toast.error("La fecha de fin debe ser mayor o igual a la fecha de inicio");
      return false;
    }

    if (!montoPromocion || isNaN(montoPromocion) || Number(montoPromocion) <= 0) {
      toast.error("El monto de la promoción debe ser un número mayor a cero");
      return false;
    }

    if (!idProducto || isNaN(Number(idProducto)) || Number(idProducto) <= 0 || !Number.isInteger(Number(idProducto))) {
      toast.error("Debe seleccionar un producto válido");
      return false;
    }

    if (!descripcionPromocion || descripcionPromocion.trim() === "") {
      toast.error("La descripción de la promoción no puede estar vacía");
      return false;
    }

    if (/^\d+$/.test(descripcionPromocion.trim())) {
      toast.error("La descripción no puede contener solo números");
      return false;
    }
  
    return true;
  };

  const agregarPromocion = async () => {
    if (!validarCamposPromocion()) {
      return;
    }


    const ajustarFechaSumandoUnDia = (fechaStr) => {
      const fecha = new Date(fechaStr);
      fecha.setDate(fecha.getDate() + 1);
      return fecha.toISOString().split('T')[0];
    };

    const promocionData = {
      descripcionPromocion: descripcionPromocion.trim(),
      fechaInicioPromocion: ajustarFechaSumandoUnDia(fechaInicioPromocion),
      fechaFinPromocion: ajustarFechaSumandoUnDia(fechaFinPromocion),
      montoPromocion,
      producto: {
        idProducto,
      },
    };

    console.log("Datos enviados al backend (con fecha ajustada):", promocionData);

    console.log(" Datos enviados al backend:", promocionData);

    try {
      await axios.post("http://localhost:8080/promocion/agregarPromocion", promocionData);
      toast.success("Promoción agregada con éxito");

    } catch (error) {
      console.error("Error al agregar promoción:", error.response?.data || error.message);
      toast.error(error.response?.data?.mensaje || "Ocurrió un error al agregar la promoción");
    }

    cargarPromociones();
    handleCloseModal();
  };

  const actualizarPromocion = async () => {
    if (!validarCamposPromocion()) return;


    const ajustarFechaSumandoUnDia = (fechaStr) => {
      const fecha = new Date(fechaStr);
      fecha.setDate(fecha.getDate() + 1);
      return fecha.toISOString().split('T')[0];
    };

    const promocionData = {
      idPromocion: promocionEdit.idPromocion,
      descripcionPromocion: descripcionPromocion.trim(),
      fechaInicioPromocion: ajustarFechaSumandoUnDia(fechaInicioPromocion),
      fechaFinPromocion: ajustarFechaSumandoUnDia(fechaFinPromocion),
      montoPromocion,
      producto: {
        idProducto,
      },
    };

    console.log("Datos enviados al backend (con fecha ajustada):", promocionData);

    try {
      console.log("Datos enviados al backend:", promocionData);
      await axios.put("http://localhost:8080/promocion/actualizar", promocionData);
      toast.success("Promoción actualizada con éxito");
      cargarPromociones();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar promoción:", error);
      toast.error("Ocurrió un error al actualizar la promoción");
    }
  };

  const eliminarPromocion = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/promocion/eliminar/${id}`);

      toast.success("Promoción eliminada con éxito");
      cargarPromociones();
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
      toast.error("Ocurrió un error al eliminar la promoción");
    }
  };

  const enviarMensaje = async (promocion) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
    });

    if (!isConfirmed) return;
    console.log("Datos enviados al backend:", promocion);
    const loadingToast = toast.loading("Enviando mensaje...");
    try {

      const response = await axios.post(`http://localhost:8080/promocion/mensaje?nombreProducto=${encodeURIComponent(promocion.nombreProducto)}`, promocion);


      if (response.status === 200) {

        toast.update(loadingToast, {
          render: "Mensaje enviado con éxito",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        cargarPromociones();
      } else {

        toast.update(loadingToast, {
          render: "Ocurrió un error al enviar el mensaje",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.error || "Ocurrió un error al enviar el mensaje",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const activarDesactivarPromocion = async (id) => {

    const promocion = promociones.find(p => p.idPromocion === id);

    if (!promocion.estadoPromocion && isPromocionVencida(promocion.fechaFinPromocion)) {
      toast.error("No se puede activar esta promoción porque su fecha de fin ya pasó");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/promocion/activar/${id}`);
      toast.success("Cambio realizado con éxito.");
      cargarPromociones();
    } catch (error) {
      console.error("Error al realizar el cambio:", error);
      toast.error("Ocurrió un error al cambiar el estado de la promocion.");
    }
  };

  const handleShowModal = (promocion = null) => {
    if (promocion) {
      setPromocionEdit(promocion);
      setDescripcionPromocion(promocion.descripcionPromocion);

      const formatearFechaParaInput = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toISOString().split('T')[0];
      };

      setFechaInicioPromocion(formatearFechaParaInput(promocion.fechaInicioPromocion));
      setFechaFinPromocion(formatearFechaParaInput(promocion.fechaFinPromocion));
      setMontoPromocion(promocion.montoPromocion);


      if (promocion.producto && promocion.producto.idProducto) {
        console.log("Caso 1: Producto encontrado como objeto:", promocion.producto.idProducto);
        setIdProducto(promocion.producto.idProducto.toString());
      }

      else if (promocion.idProducto) {
        console.log("Caso 2: Producto encontrado como ID directo:", promocion.idProducto);
        setIdProducto(promocion.idProducto.toString());
      }

      else if (promocion.nombreProducto && productos.length > 0) {
        console.log("Caso 3: Buscando producto por nombre:", promocion.nombreProducto);
        const productoEncontrado = productos.find(
          p => p.nombreProducto === promocion.nombreProducto
        );

        if (productoEncontrado) {
          console.log("Producto encontrado por nombre. ID:", productoEncontrado.idProducto);
          setIdProducto(productoEncontrado.idProducto.toString());
        } else {
          console.log("No se encontró producto con el nombre:", promocion.nombreProducto);
          setIdProducto("");
        }
      } else {
        console.log("No se encontró información de producto");
        setIdProducto("");
      }
    } else {
      setPromocionEdit(null);
      setDescripcionPromocion("");
      setFechaInicioPromocion("");
      setFechaFinPromocion("");
      setMontoPromocion("");
      setIdProducto("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPromocionEdit(null);
    setDescripcionPromocion("");
    setFechaInicioPromocion("");
    setFechaFinPromocion("");
    setMontoPromocion("");
    setIdProducto("");
  };

  const handleSearchChange = (e) => setSearch(e.target.value);
  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
  };

  const filteredPromociones = promociones.filter((promocion) => {
    const matchesSearch = promocion.descripcionPromocion.toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    if (fechaDesde || fechaHasta) {
      const fechaInicio = new Date(promocion.fechaInicioPromocion);
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        matchesDate = matchesDate && fechaInicio >= desde;
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        matchesDate = matchesDate && fechaInicio <= hasta;
      }
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredPromociones.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromociones = filteredPromociones.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  return (
    <div className="promocion-container">
      <SideBar usuario={usuario} />
      <div className="promocion-main-container">
        <h1>Gestión de promociones</h1>
        <Button className="promocion-add-button" onClick={() => handleShowModal()}>
          Agregar promoción nueva
        </Button>

        <div className="promocion-search-container">
          <label>Buscar promoción</label>
          <input
            type="text"
            className="promocion-search-input"
            placeholder="Buscar promoción por descripción."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="promocion-date-filter-container">
          <div className="promocion-filter-container">
            <div className="promocion-filter-row">
              <div className="promocion-filter-group">
                <label className="promocion-filter-label">Fecha inicio:</label>
                <input
                  type="date"
                  className="promocion-filter-input"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>
              <div className="promocion-filter-group">
                <label className="promocion-filter-label">Fecha fin:</label>
                <input
                  type="date"
                  className="promocion-filter-input"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
              <div className="promocion-filter-buttons">
                <button
                  className="promocion-filter-button promocion-filter-clear"
                  onClick={limpiarFiltros}
                  title="Limpiar filtros"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {promocionEdit ? "Actualizar Promoción" : "Agregar Promoción"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                promocionEdit ? actualizarPromocion() : agregarPromocion();
              }}
            >
              <div className="mb-3">
                <label>Descripción de la promoción</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Descripción de la promoción"
                  required
                  value={descripcionPromocion}
                  onChange={(e) => setDescripcionPromocion(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Fecha de inicio</label>
                <input
                  className="form-control"
                  type="date"
                  required
                  value={fechaInicioPromocion}
                  onChange={(e) => setFechaInicioPromocion(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Fecha de fin</label>
                <input
                  className="form-control"
                  type="date"
                  required
                  value={fechaFinPromocion}
                  onChange={(e) => setFechaFinPromocion(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Monto de la promoción</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  value={montoPromocion}
                  onChange={(e) => setMontoPromocion(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Producto relacionado</label>
                <select
                  className="form-control"
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.idProducto} value={producto.idProducto}>
                      {producto.nombreProducto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <Button type="submit" variant="primary">
                  {promocionEdit ? "Actualizar" : "Agregar"}
                </Button>

              </div>
            </form>
          </Modal.Body>
        </Modal>

        <div className="promocion-table-container">
          <table className="promocion-table">
            <thead>
              <tr className="promocion-table-header-row">
                <th>No</th>
                <th>Descripción</th>
                <th>Producto</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPromociones.length === 0 ? (
                <tr className="promocion-no-results">
                  <td colSpan="7">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="promocion-warning-icon" size="lg" />
                    <span>No hay productos disponibles</span>
                  </td>
                </tr>
              ) : (
                currentPromociones.map((promocion, index) => (
                  <tr key={promocion.idPromocion} className="promocion-table-row">
                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="promocion-descripcion">{promocion.descripcionPromocion}</td>
                    <td className="promocion-nombreProducto">{promocion.nombreProducto || "Sin producto"}</td>
                    <td className="fecha-columna fecha-inicio">{new Date(promocion.fechaInicioPromocion).toLocaleDateString()}</td>
                    <td className="fecha-columna fecha-fin">{new Date(promocion.fechaFinPromocion).toLocaleDateString()}</td>
                    <td className="precio-celda">
                      <span className="promocion-precio">₡{promocion.montoPromocion}</span>
                    </td>
                    <td>
                      <div className="promocion-actions-container">
                        <button
                          className={`promocion-status-button ${promocion.estadoPromocion ? "promocion-status-active" : "promocion-status-inactive"
                            }`}
                          onClick={() => activarDesactivarPromocion(promocion.idPromocion)}
                        >
                          {promocion.estadoPromocion ? "Activo" : "Inactivo"}
                        </button>
                        <div className="promocion-action-buttons">
                          <button
                            className="promocion-edit-button"
                            type="button"
                            onClick={() => handleShowModal(promocion)}
                            title="Editar promoción"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="promocion-delete-button"
                            type="button"
                            onClick={() => eliminarPromocion(promocion.idPromocion)}
                            title="Eliminar promoción"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <button
                            className="promocion-sendMessage-button"
                            onClick={() => enviarMensaje(promocion)}
                            disabled={isPromocionVencida(promocion.fechaFinPromocion)}
                            title={isPromocionVencida(promocion.fechaFinPromocion) ? "No se puede enviar mensaje de una promoción vencida" : "Enviar mensaje de promoción"}
                          >
                            <FontAwesomeIcon icon={faEnvelope} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {filteredPromociones.length > itemsPerPage && (
          <PaginacionApp
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        )}
      </div>
      <ToastContainer />
      <FooterApp />
    </div>
  );
};

export default PromocionApp;