import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import '../styles.min.css';
import './PedidoCrud.css';
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { FaSpinner, FaArrowLeft, FaCheck, FaTimes, FaShoppingCart, FaCalendarAlt, FaInfoCircle, FaStore } from 'react-icons/fa';

function PedidoCrud() {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    primerApellido: '',
    segundoApellido: '',
    correoUsuario: '',
    cedulaUsuario: '',
    sucursal: 'Cairo de Siquirres',
    provincia: 'Siquirres',
    localidad: 'SuperMercado en el Centro Comercial',
    fechaHoraRetiro: '',
    tipoPago: ''
  });

  const [tiposPago, setTiposPago] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [cedulaValidation, setCedulaValidation] = useState({
    isValid: false,
    isChecking: false,
    wasChecked: false,
    message: ''
  });

  const [fechaHoraRetiroValidation, setFechaHoraRetiroValidation] = useState({
    isValid: true,
    wasChecked: false,
    message: ''
  });

  const [fieldValidations, setFieldValidations] = useState({
    nombreUsuario: { isValid: true, message: '' },
    primerApellido: { isValid: true, message: '' },
    segundoApellido: { isValid: true, message: '' },
    correoUsuario: { isValid: true, message: '' }
  });

  const [loggedUser, setLoggedUser] = useState({
    nombreUsuario: '',
    correoUsuario: '',
    primerApellido: '',
    segundoApellido: ''
  });

  const [cart, setCart] = useState([]);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // Función para obtener los datos completos del usuario
  const fetchUserData = async (userId) => {
    try {
      setUserDataLoading(true);
      const response = await axios.get(`https://backend-carniceria-la-bendicion-qcvr.onrender.com/usuario/obtenerPorId/${userId}`);
      
      if (response.data) {
        const userData = response.data;
        
        // Actualizar el estado del usuario logueado
        setLoggedUser({
          nombreUsuario: userData.nombreUsuario || '',
          correoUsuario: userData.correoUsuario || '',
          primerApellido: userData.primerApellido || '',
          segundoApellido: userData.segundoApellido || ''
        });

        // Autocompletar el formulario con los datos del usuario
        setFormData(prevData => ({
          ...prevData,
          nombreUsuario: userData.nombreUsuario || prevData.nombreUsuario,
          correoUsuario: userData.correoUsuario || prevData.correoUsuario,
          primerApellido: userData.primerApellido || '',
          segundoApellido: userData.segundoApellido || ''
        }));

        console.log('Datos del usuario cargados:', userData);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos del usuario',
        severity: 'warning'
      });
    } finally {
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    const userName = localStorage.getItem("nombreUsuario");
    const userEmail = localStorage.getItem("correoUsuario");
    const userId = localStorage.getItem("idUsuario");

    if (userName && userEmail) {
      // Establecer datos básicos primero
      setLoggedUser(prevState => ({
        ...prevState,
        nombreUsuario: userName,
        correoUsuario: userEmail
      }));

      setFormData(prevData => ({
        ...prevData,
        nombreUsuario: userName,
        correoUsuario: userEmail
      }));

      // Si tenemos el ID del usuario, obtener datos completos
      if (userId) {
        fetchUserData(userId);
      } else {
        console.warn('ID de usuario no encontrado en localStorage');
      }
    } else {
      console.warn('Datos de usuario no encontrados en localStorage');
      setSnackbar({
        open: true,
        message: 'No se encontraron datos de usuario. Por favor, inicie sesión nuevamente.',
        severity: 'error'
      });
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.cedulaUsuario && formData.cedulaUsuario.trim() !== '') {
        validateCedula(formData.cedulaUsuario);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.cedulaUsuario]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("carrito")) || [];
    setCart(savedCart);

    const fetchTiposPago = async () => {
      try {
        const response = await axios.get('https://backend-carniceria-la-bendicion-qcvr.onrender.com/tipopago/');
        setTiposPago(response.data);

        if (response.data && response.data.length > 0) {
          setFormData(prevData => ({
            ...prevData,
            tipoPago: response.data[0].idTipoPago
          }));
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al cargar los tipos de pago',
          severity: 'error'
        });
      }
    };

    fetchTiposPago();
  }, []);

  const subtotal = cart.reduce((total, item) => total + (item.montoPrecioProducto * item.cantidad), 0);
  const iva = subtotal * 0.13;
  const montoTotalPedido = subtotal + iva;

  const validateLettersOnly = (value, fieldName) => {
    const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

    const isValid = value.trim() === '' || lettersOnlyRegex.test(value);

    setFieldValidations(prev => ({
      ...prev,
      [fieldName]: {
        isValid: isValid,
        message: isValid ? '' : 'Este campo solo permite letras'
      }
    }));

    return isValid;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = email.trim() === '' || emailRegex.test(email);

    setFieldValidations(prev => ({
      ...prev,
      correoUsuario: {
        isValid: isValid,
        message: isValid ? '' : 'Formato de correo electrónico inválido'
      }
    }));

    return isValid;
  };

  const validateMatchWithLoggedUser = (value, fieldName) => {
    if (!loggedUser[fieldName]) return true;

    const isValid = value === loggedUser[fieldName];

    if (!isValid) {
      const fieldDisplayName = {
        nombreUsuario: 'nombre de usuario',
        correoUsuario: 'correo',
        primerApellido: 'primer apellido',
        segundoApellido: 'segundo apellido'
      };

      setFieldValidations(prev => ({
        ...prev,
        [fieldName]: {
          isValid: false,
          message: `Este valor debe coincidir con su ${fieldDisplayName[fieldName]} registrado`
        }
      }));
    }

    return isValid;
  };

  const validateCedula = async (cedula) => {
    const cedulaRegex = /^\d{9}$/;
    if (!cedulaRegex.test(cedula)) {
      setCedulaValidation({
        isValid: false,
        isChecking: false,
        wasChecked: true,
        message: 'La cédula debe contener exactamente 9 dígitos numéricos'
      });
      return;
    }

    if (!cedula || cedula.trim().length === 0) {
      setCedulaValidation({
        isValid: false,
        isChecking: false,
        wasChecked: true,
        message: 'Ingrese un número de cédula válido'
      });
      return;
    }

    setCedulaValidation({
      ...cedulaValidation,
      isChecking: true,
      message: 'Verificando cédula...'
    });

    try {
      const response = await axios.get(`https://api.hacienda.go.cr/fe/ae?identificacion=${cedula}`);

      if (response.data && response.status === 200) {
        setCedulaValidation({
          isValid: true,
          isChecking: false,
          wasChecked: true,
          message: 'Cédula verificada correctamente'
        });
      } else {
        setCedulaValidation({
          isValid: false,
          isChecking: false,
          wasChecked: true,
          message: 'La cédula no está registrada en Hacienda'
        });
      }
    } catch (error) {
      setCedulaValidation({
        isValid: false,
        isChecking: false,
        wasChecked: true,
        message: 'La cédula no está registrada o hubo un error de verificación'
      });
    }
  };

  const validateFechaHoraRetiro = (fechaHora) => {
    if (!fechaHora) {
      setFechaHoraRetiroValidation({
        isValid: false,
        wasChecked: true,
        message: 'Debe seleccionar una fecha y hora de retiro'
      });
      return false;
    }

    const dateTime = new Date(fechaHora);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateTime < today) {
      setFechaHoraRetiroValidation({
        isValid: false,
        wasChecked: true,
        message: 'La fecha no puede ser anterior a hoy'
      });
      return false;
    }

    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const totalMinutos = hours * 60 + minutes;

    const horaMinima = 8 * 60;
    const horaMaxima = 21 * 60;

    const isValid = totalMinutos >= horaMinima && totalMinutos <= horaMaxima;

    setFechaHoraRetiroValidation({
      isValid: isValid,
      wasChecked: true,
      message: isValid ? '' : 'El horario de retiro debe ser entre 8:00 AM y 9:00 PM'
    });

    if (!isValid) {
      setSnackbar({
        open: true,
        message: 'El horario de retiro debe ser entre 8:00 AM y 9:00 PM',
        severity: 'warning'
      });
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'nombreUsuario' || name === 'primerApellido' || name === 'segundoApellido') {
      validateLettersOnly(value, name);

      // Validar coincidencia con datos del usuario logueado para todos los campos de apellidos y nombre
      if (name === 'nombreUsuario' || name === 'primerApellido' || name === 'segundoApellido') {
        validateMatchWithLoggedUser(value, name);
      }
    } else if (name === 'correoUsuario') {
      validateEmail(value);
      validateMatchWithLoggedUser(value, name);
    } else if (name === 'cedulaUsuario') {
      setCedulaValidation({
        isValid: false,
        isChecking: false,
        wasChecked: false,
        message: ''
      });
    } else if (name === 'fechaHoraRetiro') {
      validateFechaHoraRetiro(value);
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const hasValidationErrors = () => {
    for (const field in fieldValidations) {
      if (!fieldValidations[field].isValid) {
        return true;
      }
    }

    if (!cedulaValidation.isValid) {
      return true;
    }

    if (!fechaHoraRetiroValidation.isValid) {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreValid = validateLettersOnly(formData.nombreUsuario, 'nombreUsuario') &&
      validateMatchWithLoggedUser(formData.nombreUsuario, 'nombreUsuario');
    const primerApellidoValid = validateLettersOnly(formData.primerApellido, 'primerApellido') &&
      validateMatchWithLoggedUser(formData.primerApellido, 'primerApellido');
    const segundoApellidoValid = validateLettersOnly(formData.segundoApellido, 'segundoApellido') &&
      validateMatchWithLoggedUser(formData.segundoApellido, 'segundoApellido');
    const correoValid = validateEmail(formData.correoUsuario) &&
      validateMatchWithLoggedUser(formData.correoUsuario, 'correoUsuario');

    if (!nombreValid || !primerApellidoValid || !segundoApellidoValid || !correoValid) {
      setSnackbar({
        open: true,
        message: 'Por favor, corrija los campos con errores antes de continuar',
        severity: 'error'
      });
      return;
    }

    if (!cedulaValidation.isValid) {
      setSnackbar({
        open: true,
        message: 'La cédula no es válida. No se puede procesar el pedido.',
        severity: 'error'
      });
      return;
    }

    if (!validateFechaHoraRetiro(formData.fechaHoraRetiro)) {
      return;
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      const idUsuario = localStorage.getItem("idUsuario");

      const carritoData = {
        usuario: {
          idUsuario: parseInt(idUsuario, 10)
        },
        montoTotalCarrito: subtotal,
        estadoCarrito: true,
        cantidadCarrito: cart.length
      };

      const carritoResponse = await axios.post('https://backend-carniceria-la-bendicion-qcvr.onrender.com/carrito', carritoData);
      const idCarrito = carritoResponse.data.idCarrito;

      for (const item of cart) {
        const productoCarrito = {
          carrito: {
            idCarrito: idCarrito
          },
          idProducto: item.idProducto,
          cantidadProducto: item.cantidad
        };

        await axios.post(`https://backend-carniceria-la-bendicion-qcvr.onrender.com/carrito/${idCarrito}/productos`, productoCarrito);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        await axios.get(`https://backend-carniceria-la-bendicion-qcvr.onrender.com/carrito/usuario/${idUsuario}`);
      } catch (verifyError) {
      }

      const fechaHoraObj = new Date(formData.fechaHoraRetiro);
      const horaRetiro = `${fechaHoraObj.getHours().toString().padStart(2, '0')}:${fechaHoraObj.getMinutes().toString().padStart(2, '0')}`;

      const pedidoData = {
        nombreUsuario: formData.nombreUsuario,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        correoUsuario: formData.correoUsuario,
        tipoPersona: "Física",
        cedulaUsuario: formData.cedulaUsuario,
        tipoCedula: "Cédula Física",

        sucursal: formData.sucursal,
        provincia: formData.provincia,
        localidad: formData.localidad,
        horaRetiro: horaRetiro,
        fechaRetiro: formData.fechaHoraRetiro.split('T')[0],

        carrito: {
          idCarrito: idCarrito,
          usuario: {
            idUsuario: parseInt(idUsuario, 10)
          }
        },

        tipoPago: {
          idTipoPago: parseInt(formData.tipoPago, 10)
        },

        subtotal: subtotal,
        montoTotalPedido: montoTotalPedido,
        fechaPedido: formData.fechaHoraRetiro,
        estadoPedido: true,
        estadoEntregaPedido: "Pendiente"
      };

      await axios.post('https://backend-carniceria-la-bendicion-qcvr.onrender.com/pedido/agregar', pedidoData);

      await axios.put(`https://backend-carniceria-la-bendicion-qcvr.onrender.com/carrito/${idCarrito}`, {
        usuario: {
          idUsuario: parseInt(idUsuario, 10)
        },
        montoTotalCarrito: subtotal,
        estadoCarrito: false,
        cantidadCarrito: cart.length
      });

      setStatus({ loading: false, error: null, success: true });

      setSnackbar({
        open: true,
        message: 'Pedido registrado de manera exitosa',
        severity: 'success'
      });

      localStorage.removeItem("carrito");
      setCart([]);

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || "Error al procesar el pedido",
        success: false
      });

      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error al procesar el pedido",
        severity: 'error'
      });
    }
  };

  const renderCartItems = () => {
    if (cart.length > 0) {
      return cart.map((item, index) => (
        <div className="cart-item" key={index}>
          <div className="cart-item-name">{item.nombreProducto || "Producto"} × {item.cantidad}</div>
          <div className="cart-item-price">₡{((item.montoPrecioProducto || 0) * item.cantidad).toLocaleString()}</div>
        </div>
      ));
    } else {
      return (
        <div className="empty-cart">
          <p>No hay productos en el carrito</p>
        </div>
      );
    }
  };

  const isSubmitDisabled = status.loading ||
    tiposPago.length === 0 ||
    !cedulaValidation.isValid ||
    cedulaValidation.isChecking ||
    !fechaHoraRetiroValidation.isValid ||
    cart.length === 0 ||
    hasValidationErrors() ||
    userDataLoading;

  const renderErrorMessage = (fieldName) => {
    const field = fieldValidations[fieldName];
    if (!field.isValid && field.message) {
      return <div className="field-error-message">{field.message}</div>;
    }
    return null;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

return (
    <div className="pedido-container">
      <div className="orden-hero">
        <div className="orden-hero-content">
          <h1>Finalizar tu pedido</h1>
          <p>Estás a un paso de disfrutar de nuestros productos. Completa tus datos y programa el retiro.</p>
        </div>
      </div>
      <div className="contenedor-boton">
        <button 
          className="btn-back" 
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="icon-back" /> Volver
        </button>
      </div>
      <div className="pedido-content">
        
        <div className="client-info-card">
          <div className="card-header">
            <h2>Información del cliente</h2>
            {userDataLoading && (
              <div className="loading-indicator">
                <FaSpinner className="spinner" /> Cargando datos...
              </div>
            )}
          </div>
     
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombreUsuario">Nombre</label>
                <div className="readonly-field-display">
                  {userDataLoading ? "Cargando..." : (formData.nombreUsuario || "No hay datos registrados")}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="primerApellido">Primer apellido</label>
                <div className="readonly-field-display">
                  {userDataLoading ? "Cargando..." : (formData.primerApellido || "No hay datos registrados")}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="segundoApellido">Segundo apellido</label>
                <div className="readonly-field-display">
                  {userDataLoading ? "Cargando..." : (formData.segundoApellido || "No hay datos registrados")}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="correoUsuario">Correo electrónico</label>
                <div className="readonly-field-display">
                  {userDataLoading ? "Cargando..." : (formData.correoUsuario || "No hay datos registrados")}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cedulaUsuario">Cédula</label>
                <div className="cedula-input-group">
                  <input
                    type="text"
                    id="cedulaUsuario"
                    name="cedulaUsuario"
                    className={cedulaValidation.wasChecked ? (cedulaValidation.isValid ? 'valid' : 'invalid') : ''}
                    value={formData.cedulaUsuario}
                    onChange={handleChange}
                    placeholder="Ej: 101110111"
                    maxLength={9}
                    disabled={userDataLoading}
                  />
                  <div className="cedula-status">
                    {cedulaValidation.isChecking ? (
                      <FaSpinner className="spinner" />
                    ) : cedulaValidation.wasChecked ? (
                      cedulaValidation.isValid ? (
                        <FaCheck className="valid-icon" />
                      ) : (
                        <FaTimes className="invalid-icon" />
                      )
                    ) : null}
                  </div>
                </div>
                {cedulaValidation.wasChecked && (
                  <div className={`cedula-message ${cedulaValidation.isValid ? "valid-message" : "invalid-message"}`}>
                    {cedulaValidation.message}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="fechaHoraRetiro">
                  Fecha y hora de retiro
                  <span className="horario-info"> (8:00 AM - 9:00 PM)</span>
                </label>
                <div className="fecha-hora-input-group">
                  <input
                    type="datetime-local"
                    id="fechaHoraRetiro"
                    name="fechaHoraRetiro"
                    className={fechaHoraRetiroValidation.wasChecked ? (fechaHoraRetiroValidation.isValid ? 'valid' : 'invalid') : ''}
                    value={formData.fechaHoraRetiro}
                    onChange={handleChange}
                    min={`${getMinDate()}T08:00`}
                    disabled={userDataLoading}
                  />
                  <div className="fecha-hora-status">
                    {fechaHoraRetiroValidation.wasChecked && !fechaHoraRetiroValidation.isValid && (
                      <FaCalendarAlt className="invalid-icon" />
                    )}
                  </div>
                </div>
                {fechaHoraRetiroValidation.wasChecked && !fechaHoraRetiroValidation.isValid && (
                  <div className="fecha-hora-message invalid-message">
                    {fechaHoraRetiroValidation.message}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipoPago">Tipo de Pago</label>
                <select
                  id="tipoPago"
                  name="tipoPago"
                  value={formData.tipoPago}
                  onChange={handleChange}
                  disabled={tiposPago.length === 0 || userDataLoading}
                >
                  {tiposPago.length > 0 ? (
                    tiposPago.map(tipo => (
                      <option key={tipo.idTipoPago} value={tipo.idTipoPago}>
                        {tipo.descripcionTipoPago}
                      </option>
                    ))
                  ) : (
                    <option value="">Cargando tipos de pago...</option>
                  )}
                </select>
              </div>
            </div>
            <div className="info-section">
              <FaInfoCircle className="info-icon" />
              <p className="info-text">
                Los datos personales se obtienen automáticamente de tu perfil registrado. Si necesitas modificarlos, actualiza tu perfil de usuario.
              </p>
            </div>
          </div>
        </div>

        <div className="location-info-card">
          <div className="card-header">
            <h2>Información de la sucursal</h2>
          </div>
          <div className="card-body">
            <div className="location-item">
              <span className="location-label">Sucursal:</span>
              <span className="location-value">{formData.sucursal}</span>
            </div>
            <div className="location-item">
              <span className="location-label">Provincia:</span>
              <span className="location-value">{formData.provincia}</span>
            </div>
            <div className="location-item">
              <span className="location-label">Localidad:</span>
              <span className="location-value">{formData.localidad}</span>
            </div>
            <div className="info-section">
              <FaStore className="info-icon" />
              <p className="info-text">
                Retira tu pedido en nuestra sucursal de {formData.sucursal}. Horario de atención: de 8:00 AM a 9:00 PM.
              </p>
            </div>
          </div>
        </div>

        <div className="cart-summary-card">
          <div className="card-header">
            <h2><FaShoppingCart className="cart-icon" /> Resumen del pedido</h2>
          </div>
          <div className="card-body">
            <div className="cart-items">
              {renderCartItems()}
            </div>

            <div className="cart-summary">
              <div className="summary-item">
                <span>Subtotal (sin I.V.A):</span>
                <span>₡{subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>I.V.A (13%):</span>
                <span>₡{iva.toLocaleString()}</span>
              </div>
              <div className="summary-item total">
                <span>Total a pagar:</span>
                <span>₡{montoTotalPedido.toLocaleString()}</span>
              </div>
            </div>

            <div className="submit-section">
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {status.loading ? (
                  <>
                    <FaSpinner className="spinner" /> Procesando...
                  </>
                ) : (
                  'Finalizar Pedido'
                )}
              </button>
              {!cedulaValidation.isValid && cedulaValidation.wasChecked && (
                <p className="validation-warning">
                  <FaTimes className="warning-icon" /> Debe ingresar una cédula válida para finalizar el pedido
                </p>
              )}
              {!fechaHoraRetiroValidation.isValid && fechaHoraRetiroValidation.wasChecked && (
                <p className="validation-warning">
                  <FaCalendarAlt className="warning-icon" /> Debe seleccionar una fecha y hora de retiro dentro del horario permitido
                </p>
              )}
              {Object.keys(fieldValidations).some(key => !fieldValidations[key].isValid) && (
                <p className="validation-warning">
                  <FaTimes className="warning-icon" /> Por favor, corrija los campos con errores antes de continuar
                </p>
              )}
              {userDataLoading && (
                <p className="validation-warning">
                  <FaSpinner className="warning-icon spinner" /> Cargando datos del usuario...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style>
        {`
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .horario-info {
            font-size: 0.8em;
            color: #666;
            font-weight: normal;
          }
          
          .field-error-message {
            color: #f44336;
            font-size: 0.85em;
            margin-top: 5px;
          }
          
          .field-info-message {
            color: #2196F3;
            font-size: 0.85em;
            margin-top: 5px;
          }
          
          input.invalid, select.invalid {
            border-color: #f44336;
            background-color: rgba(244, 67, 54, 0.05);
          }
          
          .readonly-field-display {
            background-color: transparent;
            color: #495057;
            border: 1px solid #e0e0e0;
            padding: 12px 15px;
            border-radius: 4px;
            font-size: 14px;
            min-height: 20px;
            display: flex;
            align-items: center;
          }
          
          .readonly-field-display:empty::before {
            content: "No hay datos registrados";
            color: #6c757d;
            font-style: italic;
          }
          
          .fecha-hora-input-group {
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .fecha-hora-status {
            position: absolute;
            right: 10px;
            display: flex;
            align-items: center;
          }
          
          .fecha-hora-message {
            margin-top: 5px;
            font-size: 0.85em;
          }
          
          input[type="datetime-local"].valid {
            border-color: #4caf50;
          }
          
          input[type="datetime-local"].invalid {
            border-color: #f44336;
          }
          
          .hora-input-group {
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .hora-status {
            position: absolute;
            right: 10px;
            display: flex;
            align-items: center;
          }
          
          .hora-message {
            margin-top: 5px;
            font-size: 0.85em;
          }
          
          .invalid-message {
            color: #f44336;
          }
          
          .valid-message {
            color: #4caf50;
          }
          
          .valid-icon {
            color: #4caf50;
          }
          
          .invalid-icon {
            color: #f44336;
          }
          
          .warning-icon {
            margin-right: 5px;
          }
          
          .loading-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 0.9em;
          }
          
          input:disabled, select:disabled {
            background-color: #f5f5f5;
            color: #999;
            cursor: not-allowed;
          }
          
          .validation-warning {
            display: flex;
            align-items: center;
            color: #f44336;
            font-size: 0.9em;
            margin-top: 10px;
          }
        `}
      </style>
    </div>
  );
}

export default PedidoCrud;