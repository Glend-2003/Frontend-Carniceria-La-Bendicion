import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import SideBar from "../SideBar/SideBar";
import useAuth from "../../hooks/useAuth";
import { Button, Modal } from "react-bootstrap";
import FooterApp from "../Footer/FooterApp";
import "./TipoPago.css";
import PaginacionApp from "../Paginacion/PaginacionApp";

const TipoPagoApp = () => {
  const [tipoPagos, setTipoPagos] = useState([]);
  const [tipoPagoEdit, setTipoPagoEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();
  const [search, setSearch] = useState("");
  const [descripcionTipoPago, setDescripcionTipoPago] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarTipoPago();
  }, []);

  const cargarTipoPago = async () => {
    try {
      const response = await axios.get("http://localhost:8080/tipopago/");
      setTipoPagos(response.data);
    } catch (error) {
      console.error("Error al cargar tipos de pago:", error);
      toast.error("Ocurrió un error al cargar los tipos de pago");
    }
  };

  const validarCamposTipoPago = () => {
    if (!descripcionTipoPago.trim()) {
      toast.error("Debe ingresar una descripción");
      return false;
    }
    return true;
  };

  const showAlertaInactivo = () => {
    Swal.fire({
      title: "Tipo pago inactivo",
      text: "No puedes editar un registro inactivo.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }

  const agregarTipoPago = async () => {
    if (!validarCamposTipoPago()) return;

    const tipoPagoDuplicado = tipoPagos.some(
      (tipoPago) =>
        tipoPago.descripcionTipoPago.toLowerCase() ===
        descripcionTipoPago.trim().toLowerCase()
    );

    if (tipoPagoDuplicado) {
      toast.error("El nombre del tipo de pago ya existe. Por favor, elige un nombre diferente.");
      return;
    }

    try {
      const tipoPagoData = {
        descripcionTipoPago: descripcionTipoPago.trim(),
        estadoTipoPago: 1,
      };

      await axios.post("http://localhost:8080/tipopago/agregar", tipoPagoData);
      toast.success("Tipo de pago agregado con éxito");
      cargarTipoPago();
      handleCloseModal();
    } catch (error) {
      console.error("Error al agregar tipo de pago:", error);
      toast.error("Ocurrió un error al agregar el tipo de pago");
    }
  };

  const actualizarTipoPago = async () => {
    if (!validarCamposTipoPago()) return;

    const tipoPagoDuplicado = tipoPagos.some(
      (tipoPago) =>
        tipoPago.idTipoPago !== tipoPagoEdit.idTipoPago &&
        tipoPago.descripcionTipoPago.toLowerCase() ===
        descripcionTipoPago.trim().toLowerCase()
    );

    if (tipoPagoDuplicado) {
      toast.error("El nombre del tipo de pago ya existe. Por favor, elige un nombre diferente.");
      return;
    }
    
    const tipoPagoData = {
      idTipoPago: tipoPagoEdit.idTipoPago,
      descripcionTipoPago: descripcionTipoPago.trim(),
      estadoTipoPago: 1,
    };

    try {
      await axios.put("http://localhost:8080/tipopago/actualizar", tipoPagoData);
      toast.success("Tipo pago actualizado con éxito");
      cargarTipoPago();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar tipo pago:", error);
      toast.error("Ocurrió un error al actualizar el tipo pago");
    }
  };

  const activarDesactivarTipoPago = async (id) => {
    try {
      await axios.put(`http://localhost:8080/tipopago/activar/${id}`);
      toast.success("Cambio realizado con éxito.");
      cargarTipoPago();
    } catch (error) {
      console.error("Error al realizar el cambio:", error);
      toast.error("Ocurrió un error al cambiar el estado del tipo pago.");
    }
  };

  const handleShowModal = (tipoPago = null) => {
    if (tipoPago) {
      setTipoPagoEdit(tipoPago);
      setDescripcionTipoPago(tipoPago.descripcionTipoPago);
    } else {
      setTipoPagoEdit(null);
      setDescripcionTipoPago("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTipoPagoEdit(null);
    setDescripcionTipoPago("");
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredTipoPagos = tipoPagos.filter((tipoPago) =>
    tipoPago.descripcionTipoPago.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTipoPagos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTipoPagos = filteredTipoPagos.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="tipopago-container">
      <SideBar usuario={usuario} />
      <div className="tipopago-main-container">
        <h1>Gestión de tipos de pago</h1>
        <Button className="tipopago-add-button" onClick={() => handleShowModal()}>
          Agregar nuevo tipo de pago
        </Button>
        <div className="tipopago-search-container">
          <label>Buscar tipo de pago</label>
          <input
            type="text"
            className="tipopago-search-input"
            placeholder="Buscar tipo de pago por descripción"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Modal show={showModal} onHide={handleCloseModal} className="tipopago-modal" size="md" centered>
          <Modal.Header
            closeButton
            className="tipopago-modal-header"
            style={{
              backgroundColor: '#9fc45a',
              color: '#000',
              borderBottom: 'none'
            }}
          >
            <Modal.Title>
              {tipoPagoEdit ? "Actualizar Tipo de Pago" : "Agregar Tipo de Pago"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tipopago-modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                tipoPagoEdit ? actualizarTipoPago() : agregarTipoPago();
              }}
            >
              <div className="tipopago-form-group">
                <label>Nombre del tipo de pago</label>
                <input
                  className="tipopago-form-control"
                  type="text"
                  placeholder="Nombre del tipo de pago"
                  required
                  value={descripcionTipoPago}
                  onChange={(e) => setDescripcionTipoPago(e.target.value)}
                />
              </div>

              <div className="tipopago-form-actions">
                <Button variant="outline-secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button className="tipopago-submit-button" type="submit">
                  {tipoPagoEdit ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <div className="tipopago-table-container">
          <table className="tipopago-table">
            <thead>
              <tr className="tipopago-table-header-row">
                <th className="tipopago-header-no">NO.</th>
                <th className="tipopago-header-nombre">TIPO DE PAGO</th>
                <th className="tipopago-header-estado">ESTADO</th>
                <th className="tipopago-header-acciones">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {currentTipoPagos.length === 0 ? (
                <tr className="tipopago-no-results">
                  <td colSpan="4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="tipopago-warning-icon" size="lg" />
                    <span>No hay tipos de pago disponibles</span>
                  </td>
                </tr>
              ) : (
                currentTipoPagos.map((tipoPago, index) => (
                  <tr key={tipoPago.idTipoPago} className="tipopago-table-row">
                    <td className="tipopago-no-cell">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="tipopago-description-cell">
                      {tipoPago.descripcionTipoPago}
                    </td>
                    <td className="tipopago-status-cell">
                      <button
                        className={`tipopago-status-button ${
                          tipoPago.estadoTipoPago ? "tipopago-status-active" : "tipopago-status-inactive"
                        }`}
                        onClick={() => activarDesactivarTipoPago(tipoPago.idTipoPago)}
                      >
                        {tipoPago.estadoTipoPago ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="tipopago-actions-cell">
                      <div className="tipopago-action-buttons">
                        <button
                          className="tipopago-edit-button"
                          type="button"
                          onClick={() => {
                            if (!tipoPago.estadoTipoPago) {
                              showAlertaInactivo();
                            } else {
                              handleShowModal(tipoPago);
                            }
                          }}
                          title="Editar tipo de pago"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredTipoPagos.length > itemsPerPage && (
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

export default TipoPagoApp;