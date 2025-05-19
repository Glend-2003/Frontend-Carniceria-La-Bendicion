import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SideBar from "../SideBar/SideBar";
import useAuth from "../../hooks/useAuth";
import FooterApp from "../Footer/FooterApp";
import "./Comentario.css";
import PaginacionApp from "../Paginacion/PaginacionApp";

const ComentarioApp = () => {
  const { usuario } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [comentarioEdit, setComentarioEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [descripcionComentario, setDescripcionComentario] = useState("");
  const [numCalificacion, setNumCalificacion] = useState("");
  const [verificacion, setVerificacion] = useState("Activo");
  const [currentPage, setCurrentPage] = useState(1);
  const [usuarioCorreos, setUsuarioCorreos] = useState({});
  console.log("UsuarioCorreo" + usuarioCorreos);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarComentarios();
  }, []);

  const cargarComentarios = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/comentario/admin"
      );
      console.log("Comentarios recibidos del backend:", response.data);
      setComentarios(response.data); 
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      toast.error("Ocurrió un error al cargar los comentarios");
    }
  };

  const cargarUsuario = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/usuario/obtenerPorId/${id}`
      );
      console.log("Usuario recibido del backend:", response.data);

      setUsuarioCorreos((prevCorreos) => ({
        ...prevCorreos,
        [id]: response.data.correoUsuario,
      }));
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      toast.error("Ocurrió un error al cargar el usuario");
    }
  };

  const validarCamposComentario = () => {
    if (!descripcionComentario.trim() || !numCalificacion) {
      toast.error("Todos los campos son obligatorios y no pueden estar vacíos");
      return false;
    }
    return true;
  };

  const agregarComentario = async () => {
    if (!validarCamposComentario()) return;

    try {
      const fechaComentario = new Date().toISOString();
      const comentarioData = {
        descripcionComentario: descripcionComentario.trim(),
        numCalificacion: numCalificacion,
        fechaComentario: fechaComentario,
        usuario: { idUsuario: usuario.idUsuario },
      };

      await axios.post(
        "http://localhost:8080/comentario/agregar",
        comentarioData
      );

      toast.success("Comentario agregado con éxito");
      cargarComentarios();
      handleCloseModal();
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      toast.error("Ocurrió un error al agregar el comentario");
    }
  };

  const actualizarComentario = async () => {
    if (!validarCamposComentario()) return;

    try {
      await axios.put("http://localhost:8080/comentario/actualizar", {
        idComentario: comentarioEdit.idComentario,
        descripcionComentario: descripcionComentario.trim(),
        numCalificacion,
        verificacion,
      });
      toast.success("Comentario actualizado con éxito");
      cargarComentarios();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      toast.error("Ocurrió un error al actualizar el comentario");
    }
  };

  const verificacionEstado = async (id) => {
    try {
      await axios.put(`http://localhost:8080/comentario/verificar/${id}`);
      toast.success("Cambio realizado con éxito.");
      cargarComentarios();
    } catch (error) {
      console.error("Error al realizar la verificación del comentario:", error);
      toast.error("Ocurrió un error al cambiar el estado del comentario.");
    }
  };

  const activarComentario = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/comentario/activar/${id}`);
      toast.success("Comentario eliminado con éxito");
      cargarComentarios();
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("Ocurrió un error al eliminar el comentario");
    }
  };

  const handleShowModal = (comentario = null) => {
    if (comentario) {
      setComentarioEdit(comentario);
      setDescripcionComentario(comentario.descripcionComentario);
      setNumCalificacion(comentario.numCalificacion);
      setVerificacion(comentario.verificacion);
    } else {
      setComentarioEdit(null);
      setDescripcionComentario("");
      setNumCalificacion("");
      setVerificacion("Activo");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setComentarioEdit(null);
    setDescripcionComentario("");
    setNumCalificacion("");
    setVerificacion("Activo");
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredComentarios = comentarios.filter(
    (comentario) =>
      comentario.descripcionComentario &&
      comentario.descripcionComentario
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredComentarios.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComentarios = filteredComentarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="comentario-container">
      <SideBar usuario={usuario} />
      <div className="comentario-main-container">
        <h1>Gestión de comentarios</h1>
        <Button
          className="comentario-add-button"
          onClick={() => handleShowModal()}
        >
          Agregar comentario nuevo
        </Button>
        <div className="mb-2"></div>

        <div className="comentario-search-container">
          <label>Buscar comentario</label>
          <input
            type="text"
            className="comentario-search-input"
            placeholder="Buscar comentario"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {comentarioEdit ? "Actualizar Comentario" : "Agregar Comentario"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                comentarioEdit ? actualizarComentario() : agregarComentario();
              }}
            >
              <div className="mb-3">
                <label>Escribe tu comentario</label>
                <textarea
                  className="form-control"
                  placeholder="Comentar.."
                  required
                  value={descripcionComentario}
                  onChange={(e) => setDescripcionComentario(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Deja tu calificación</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Calificación"
                  required
                  value={numCalificacion}
                  onChange={(e) => setNumCalificacion(e.target.value)}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              {comentarioEdit ? "Actualizar" : "Agregar"}
            </Button>
          </Modal.Footer>
        </Modal>

        <ToastContainer />

        <div className="comentario-table-container">
          <table className="comentario-table">
            <thead>
              <tr className="comentario-table-header-row">
                <th>No</th>
                <th>Usuario</th>
                <th>Comentario</th>
                <th>Calificación</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentComentarios.length === 0 ? (
                <tr className="comentario-no-results">
                  <td colSpan="6">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> No hay
                    comentarios.
                  </td>
                </tr>
              ) : (
                currentComentarios.map((comentario, index) => (
                  <tr
                    key={comentario.idComentario}
                    className="comentario-table-row"
                  >
                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="comentario-letraNegrita">
                      {comentario.correoUsuario || "Correo no disponible"}
                    </td>
                    <td className="comentario-letraComun">
                      {comentario.descripcionComentario}
                    </td>
                    <td className="comentario-letraNegrita">
                      {comentario.numCalificacion}
                    </td>
                    <td className="fecha-columna fecha">
                      {new Date(
                        comentario.fechaComentario
                      ).toLocaleDateString() || "Fecha no disponible"}
                    </td>
                    <td className="comentario-action-column">
                      <button
                        className={`comentario-status-button ${
                          comentario.verificacion
                            ? "comentario-status-active"
                            : "comentario-status-inactive"
                        }`}
                        onClick={() =>
                          verificacionEstado(comentario.idComentario)
                        }
                      >
                        {comentario.verificacion ? "Visible" : "Oculto"}
                      </button>
                      <button
                        className="comentario-delete-button"
                        type="button"
                        onClick={() =>
                          activarComentario(comentario.idComentario)
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginacionApp
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </div>
      <FooterApp />
    </div>
  );
};

export default ComentarioApp;