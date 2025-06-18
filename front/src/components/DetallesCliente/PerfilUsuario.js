import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PerfilUsuario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faPhone, faIdCard, faCalendarAlt, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import FooterApp from '../Footer/FooterApp';
import NavbarApp from "../Navbar/NavbarApp";
import SideBarUsuario from '../DetallesCliente/SideBarUsuario';
import { useAppContext } from "../Navbar/AppContext";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PerfilUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaValida, setCedulaValida] = useState(true);
  const [nombreApellidosValidos, setNombreApellidosValidos] = useState({
    nombreUsuario: true,
    primerApellido: true,
    segundoApellido: true
  });
  
  // Estados para el Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/-/g, "");
    
    if (telefonoLimpio.length !== 8 || !/^\d+$/.test(telefonoLimpio)) {
      setFormErrors(prev => ({ ...prev, telefonoUsuario: "El teléfono debe tener 8 dígitos" }));
      return false;
    } else {
      setFormErrors(prev => ({ ...prev, telefonoUsuario: "" }));
      return true;
    }
  };

  const [formData, setFormData] = useState({
    cedulaUsuario: "",
    nombreUsuario: "",
    primerApellido: "",
    segundoApellido: "",
    telefonoUsuario: "",
    fechaNacimiento: "",
  });

  const [formErrors, setFormErrors] = useState({
    cedulaUsuario: "",
    nombreUsuario: "",
    primerApellido: "",
    segundoApellido: "",
    telefonoUsuario: "",
    fechaNacimiento: "",
  });

  const { handleLogout } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

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
    if (usuario) {
      setFormData({ ...usuario });
      if (usuario.fechaNacimiento) {
        const fecha = new Date(usuario.fechaNacimiento);
        const formattedDate = fecha.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, fechaNacimiento: formattedDate }));
      
        if (usuario.cedulaUsuario) {
          validarCedula(usuario.cedulaUsuario);
        }
      }
    }
  }, [usuario]);

  const validarCedula = async (cedula) => {
    if (!cedula || cedula.trim() === "") {
      setFormErrors(prev => ({ ...prev, cedulaUsuario: "La cédula es obligatoria" }));
      setCedulaValida(false);
      return false;
    }

    try {
      setValidatingCedula(true);
      const response = await axios.get(`https://api.hacienda.go.cr/fe/ae?identificacion=${cedula}`);
      
      if (response.data && response.data.nombre) {
        setCedulaValida(true);
        setFormErrors(prev => ({ ...prev, cedulaUsuario: "" }));
        return true;
      } else {
        setCedulaValida(false);
        setFormErrors(prev => ({ ...prev, cedulaUsuario: "Cédula no válida según el Ministerio de Hacienda" }));
        return false;
      }
    } catch (error) {
      setCedulaValida(false);
      setFormErrors(prev => ({ ...prev, cedulaUsuario: "No se pudo validar la cédula. Verifique que sea correcta." }));
      return false;
    } finally {
      setValidatingCedula(false);
    }
  };

  const validarSoloLetras = (texto, campo) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const esValido = regex.test(texto);
    
    setNombreApellidosValidos(prev => ({ ...prev, [campo]: esValido }));
    
    if (!esValido) {
      setFormErrors(prev => ({ ...prev, [campo]: "Solo se permiten letras" }));
      return false;
    } else {
      setFormErrors(prev => ({ ...prev, [campo]: "" }));
      return true;
    }
  };

  const formatearTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    const telefonoLimitado = telefonoLimpio.substring(0, 8);
    
    if (telefonoLimitado.length >= 5) {
      return `${telefonoLimitado.substring(0, 4)}-${telefonoLimitado.substring(4)}`;
    } else if (telefonoLimitado.length > 0) {
      return telefonoLimitado;
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefonoUsuario") {
      setFormData({ ...formData, [name]: formatearTelefono(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "nombreUsuario" || name === "primerApellido" || name === "segundoApellido") {
      validarSoloLetras(value, name);
    }
    
    if (name === "telefonoUsuario") {
      validarTelefono(formatearTelefono(value));
    }
  };

  const validarFormulario = async () => {
    let formValido = true;
    let nuevoFormErrors = { ...formErrors };

    if (isEditing) {
      const cedulaValida = await validarCedula(formData.cedulaUsuario);
      if (!cedulaValida) formValido = false;
    }

    if (!validarSoloLetras(formData.nombreUsuario, "nombreUsuario")) formValido = false;
    if (!validarSoloLetras(formData.primerApellido, "primerApellido")) formValido = false;
    if (formData.segundoApellido && !validarSoloLetras(formData.segundoApellido, "segundoApellido")) formValido = false;

    if (!validarTelefono(formData.telefonoUsuario)) formValido = false;

    if (!formData.fechaNacimiento) {
      nuevoFormErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
      formValido = false;
    } else {
      nuevoFormErrors.fechaNacimiento = "";
    }

    setFormErrors(nuevoFormErrors);
    return formValido;
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    const esValido = await validarFormulario();
    if (!esValido) {
      showSnackbar("Por favor corrige los errores en el formulario", "error");
      return;
    }

    const userData = {
      ...formData,
      idUsuario: usuario.idUsuario
    };

    try {
      await axios.put("http://localhost:8080/usuario/actualizarCredenciales", userData);
      showSnackbar("Tus datos se han actualizado correctamente", "success");
      setIsEditing(false);
    } catch (error) {
      showSnackbar("Error al actualizar tus datos. Por favor intenta nuevamente.", "error");
    }
  };
  return (
    <div className="page-container">
    
        <NavbarApp />
              <div className="catalogo-hero">
            <div className="catalogo-hero-content">
              <h1>MIS CREDENCIALES </h1>
            </div>
          </div>

      <div className="perfil-usuario-container">
        <SideBarUsuario usuario={usuario} handleLogout={handleLogout} />

        <div className="profile-content">
          <div className="profile-header">
            <h2>Mi Perfil</h2>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h3>Información Personal</h3>
              {!isEditing ? (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </button>
              ) : (
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    if (usuario) setFormData({ ...usuario });
                    setFormErrors({
                      cedulaUsuario: "",
                      nombreUsuario: "",
                      primerApellido: "",
                      segundoApellido: "",
                      telefonoUsuario: "",
                      fechaNacimiento: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faIdCard} className="input-icon" /> Cédula
                  </label>
                  <div className="input-with-validation">
                    <input
                      type="text"
                      className={`form-input ${formErrors.cedulaUsuario ? 'is-invalid' : ''}`}
                      name="cedulaUsuario"
                      value={formData.cedulaUsuario}
                      onChange={handleChange}
                      onBlur={() => isEditing && validarCedula(formData.cedulaUsuario)}
                      required
                      disabled={!isEditing}
                    />
                    {isEditing && validatingCedula && (
                      <div className="validation-icon loading">Validando...</div>
                    )}
                    {isEditing && !validatingCedula && formData.cedulaUsuario && (
                      <div className={`validation-icon ${cedulaValida ? 'valid' : 'invalid'}`}>
                        <FontAwesomeIcon icon={cedulaValida ? faCheckCircle : faExclamationCircle} />
                      </div>
                    )}
                  </div>
                  {formErrors.cedulaUsuario && (
                    <div className="error-message">{formErrors.cedulaUsuario}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FontAwesomeIcon className="input-icon" /> Nombre
                  </label>
                  <div className="input-with-validation">
                    <input
                      type="text"
                      className={`form-input ${formErrors.nombreUsuario ? 'is-invalid' : ''}`}
                      name="nombreUsuario"
                      value={formData.nombreUsuario}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                    />
                    {isEditing && formData.nombreUsuario && (
                      <div className={`validation-icon ${nombreApellidosValidos.nombreUsuario ? 'valid' : 'invalid'}`}>
                        <FontAwesomeIcon icon={nombreApellidosValidos.nombreUsuario ? faCheckCircle : faExclamationCircle} />
                      </div>
                    )}
                  </div>
                  {formErrors.nombreUsuario && (
                    <div className="error-message">{formErrors.nombreUsuario}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Primer Apellido</label>
                  <div className="input-with-validation">
                    <input
                      type="text"
                      className={`form-input ${formErrors.primerApellido ? 'is-invalid' : ''}`}
                      name="primerApellido"
                      value={formData.primerApellido}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                      
                    />
                    {isEditing && formData.primerApellido && (
                      <div className={`validation-icon ${nombreApellidosValidos.primerApellido ? 'valid' : 'invalid'}`}>
                        <FontAwesomeIcon icon={nombreApellidosValidos.primerApellido ? faCheckCircle : faExclamationCircle} />
                      </div>
                    )}
                  </div>
                  {formErrors.primerApellido && (
                    <div className="error-message">{formErrors.primerApellido}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Segundo Apellido</label>
                  <div className="input-with-validation">
                    <input
                      type="text"
                      className={`form-input ${formErrors.segundoApellido ? 'is-invalid' : ''}`}
                      name="segundoApellido"
                      value={formData.segundoApellido}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    {isEditing && formData.segundoApellido && (
                      <div className={`validation-icon ${nombreApellidosValidos.segundoApellido ? 'valid' : 'invalid'}`}>
                        <FontAwesomeIcon icon={nombreApellidosValidos.segundoApellido ? faCheckCircle : faExclamationCircle} />
                      </div>
                    )}
                  </div>
                  {formErrors.segundoApellido && (
                    <div className="error-message">{formErrors.segundoApellido}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faPhone} className="input-icon" /> Teléfono
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.telefonoUsuario ? 'is-invalid' : ''}`}
                    name="telefonoUsuario"
                    value={formData.telefonoUsuario}
                    onChange={handleChange}
                    onBlur={() => validarTelefono(formData.telefonoUsuario)}
                    placeholder="9999-9999"
                    maxLength="9"
                    disabled={!isEditing}
                    required
                  />
                  {formErrors.telefonoUsuario && (
                    <div className="error-message">{formErrors.telefonoUsuario}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" /> Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    className={`form-input ${formErrors.fechaNacimiento ? 'is-invalid' : ''}`}
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  {formErrors.fechaNacimiento && (
                    <div className="error-message">{formErrors.fechaNacimiento}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="save-btn">
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


export default PerfilUsuario;