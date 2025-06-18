import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./DireccionUsuario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import FooterApp from "../Footer/FooterApp";
import { FaFileAlt, FaDownload, FaUser, FaSignOutAlt, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import NavbarApp from "../Navbar/NavbarApp";
import useAuth from "../../hooks/useAuth";
import SideBarUsuario from '../DetallesCliente/SideBarUsuario';
import { useAppContext } from "../Navbar/AppContext";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DireccionUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [provincias, setProvincia] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [direccionCompleta, setDireccionCompleta] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [formData, setFormData] = useState({
    codigoPostalDireccion: "",
    descripcionDireccion: "",
    idProvincia: "",
    idCanton: "",
    idDistrito: "",
  });

  const { handleLogout } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  const isValidPostalCodeFormat = (code) => {
    return /^\d{5}$/.test(code);
  };

  // Función para mostrar el Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    if (usuario?.correoUsuario) {
      cargarDireccionUsuario();
      cargarProvincias();
    }
  }, [usuario]);

  const cargarDireccionUsuario = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/direccion/buscar-por-correo`, 
        {
          params: { correoUsuario: usuario.correoUsuario },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        setDireccionCompleta(response.data);
        
        setFormData({
          codigoPostalDireccion: response.data.codigoPostalDireccion || "",
          descripcionDireccion: response.data.descripcionDireccion || "",
          idProvincia: response.data.idProvincia || "",
          idCanton: response.data.idCanton || "",
          idDistrito: response.data.idDistrito || ""
        });
        
        if (response.data.idProvincia) {
          await cargarCantonesPorProvincia(response.data.idProvincia);
        }
        
        if (response.data.idCanton) {
          await cargarDistritosPorCanton(response.data.idCanton);
        }
      }
    } catch (error) {
      console.error("Error al cargar la dirección del usuario:", error);
      
      if (error.response?.status !== 404) {
        showSnackbar("No se pudo cargar la información de dirección", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.idProvincia && !loading) {
      cargarCantones();
    } else if (!loading) {
      setCantones([]);
      if (!direccionCompleta) {
        setFormData(prev => ({ ...prev, idCanton: "", idDistrito: "" }));
      }
    }
  }, [formData.idProvincia, loading]);

  useEffect(() => {
    if (formData.idCanton && !loading) {
      cargarDistritos();
    } else if (!loading) {
      setDistritos([]);
      if (!direccionCompleta) {
        setFormData(prev => ({ ...prev, idDistrito: "" }));
      }
    }
  }, [formData.idCanton, loading]);

  const cargarProvincias = async () => {
    try {
      const response = await axios.get("http://localhost:8080/provincia/leer");
      setProvincia(response.data);
    } catch (error) {
      console.error("Error al cargar las provincias:", error);
      showSnackbar("Ocurrió un error al cargar las provincias");
    }
  };

  const cargarCantonesPorProvincia = async (idProvincia) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/canton/leerPorProvincia/${idProvincia}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCantones(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al cargar los cantones:", error);
      return [];
    }
  };

  const cargarDistritosPorCanton = async (idCanton) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/distrito/leerPorCanton/${idCanton}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDistritos(response.data);
      return response.data;
    } catch (error) {
      console.error("Error al cargar los distritos:", error);
      return [];
    }
  };

  const cargarCantones = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/canton/leerPorProvincia/${formData.idProvincia}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCantones(response.data);
    } catch (error) {
      console.error("Error al cargar los cantones:", error);
      showSnackbar("Ocurrió un error al cargar los cantones");
    }
  };

  const cargarDistritos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/distrito/leerPorCanton/${formData.idCanton}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDistritos(response.data);
    } catch (error) {
      console.error("Error al cargar los distritos:", error);
      showSnackbar("Ocurrió un error al cargar los distritos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "codigoPostalDireccion") {
      if (value === "" || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBlurPostalCode = () => {
    if (formData.codigoPostalDireccion && !isValidPostalCodeFormat(formData.codigoPostalDireccion)) {
      showSnackbar("El código postal debe tener exactamente 5 dígitos", "warning");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descripcionDireccion || !formData.idDistrito) {
      showSnackbar("Descripción y distrito son obligatorios", "error");
      return;
    }

    if (formData.codigoPostalDireccion && !isValidPostalCodeFormat(formData.codigoPostalDireccion)) {
      showSnackbar("El código postal debe tener exactamente 5 dígitos", "error");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/direccion/guardar", 
        null, 
        {
          params: {
            idUsuario: usuario.idUsuario,
            descripcion: formData.descripcionDireccion,
            codigoPostal: formData.codigoPostalDireccion || "",
            idDistrito: formData.idDistrito
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      showSnackbar(response.data, "success");
      setIsEditing(false);
      
      cargarDireccionUsuario();
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        showSnackbar("Sesión expirada, por favor ingrese nuevamente", "error");
      } else {
        console.error("Error:", error.response?.data);
        showSnackbar(error.response?.data || "Error al guardar la dirección", "error");
      }
    }
  };



  return (
    <div className="profile-page">
      <NavbarApp />
       
        <div className="catalogo-hero">
      <div className="catalogo-hero-content">
        <h1>MI DIRECCIÓN </h1>
      </div>
    </div>
      <div className="perfil-usuario-container">
        <SideBarUsuario usuario={usuario} handleLogout={handleLogout} />

        <div className="profile-content">
          <div className="profile-header">
            <h2>Mi Dirección</h2>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h3>Información de Dirección</h3>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Dirección
                </button>
              ) : (
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    if (direccionCompleta) {
                      setFormData({
                        codigoPostalDireccion: direccionCompleta.codigoPostalDireccion || "",
                        descripcionDireccion: direccionCompleta.descripcionDireccion || "",
                        idProvincia: direccionCompleta.idProvincia || "",
                        idCanton: direccionCompleta.idCanton || "",
                        idDistrito: direccionCompleta.idDistrito || ""
                      });
                    }
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>

            {direccionCompleta && !isEditing && (
              <div className="direccion-display">
                <div className="direccion-completa">
                  <h4>Dirección actual:</h4>
                  <p>
                    {direccionCompleta.descripcionDireccion}, 
                    {direccionCompleta.nombreDistrito && ` ${direccionCompleta.nombreDistrito},`} 
                    {direccionCompleta.nombreCanton && ` ${direccionCompleta.nombreCanton},`}
                    {direccionCompleta.nombreProvincia && ` ${direccionCompleta.nombreProvincia}`}
                    {direccionCompleta.codigoPostalDireccion && ` - C.P: ${direccionCompleta.codigoPostalDireccion}`}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" /> Código Postal
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    name="codigoPostalDireccion"
                    value={formData.codigoPostalDireccion}
                    onChange={handleChange}
                    onBlur={handleBlurPostalCode}
                    placeholder="Ej: 10101 (opcional)"
                    disabled={!isEditing}
                    maxLength="5"
                  />
                  <small className="text-muted">Debe contener exactamente 5 dígitos</small>
                </div>

                <div className="form-group full-width">
                  <label>Descripción de la dirección</label>
                  <textarea
                    className="form-input"
                    name="descripcionDireccion"
                    value={formData.descripcionDireccion}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Casa color azul, 100m norte del parque central"
                    rows={3}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>Provincia</label>
                  <select
                    className="form-input"
                    name="idProvincia"
                    value={formData.idProvincia}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        idProvincia: e.target.value,
                        idCanton: "",
                        idDistrito: ""
                      });
                    }}
                    required
                    disabled={!isEditing}
                  >
                    <option value="">Seleccione una provincia</option>
                    {provincias.map((provincia) => (
                      <option key={provincia.idProvincia} value={provincia.idProvincia}>
                        {provincia.nombreProvincia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cantón</label>
                  <select
                    className="form-input"
                    name="idCanton"
                    value={formData.idCanton}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        idCanton: e.target.value,
                        idDistrito: ""
                      });
                    }}
                    required
                    disabled={!formData.idProvincia || !isEditing}
                  >
                    <option value="">Seleccione un cantón</option>
                    {cantones.map((canton) => (
                      <option key={canton.idCanton} value={canton.idCanton}>
                        {canton.nombreCanton}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Distrito</label>
                  <select
                    className="form-input"
                    name="idDistrito"
                    value={formData.idDistrito}
                    onChange={handleChange}
                    required
                    disabled={!formData.idCanton || !isEditing}
                  >
                    <option value="">Seleccione un distrito</option>
                    {distritos.map((distrito) => (
                      <option key={distrito.idDistrito} value={distrito.idDistrito}>
                        {distrito.nombreDistrito}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-btn"
                  >
                    <FontAwesomeIcon icon={faSave} /> Guardar Cambios
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

       
      </div>
       <FooterApp />

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
    </div>
  );
};

export default DireccionUsuario;