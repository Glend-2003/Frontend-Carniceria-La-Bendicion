import React, { useState, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from "../Navbar/AppContext"; 
import { FaEye, FaEyeSlash, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import '../Login/Login.css'; 
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { setEncryptedLocalStorage } from '../Utils/StorageUtils';

const AuthOffcanvas = () => {
  const { showSidebar, handleShowSidebar, updateUserStatus } = useAppContext();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    correoUsuario: "",
    contraseniaUsuario: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailValidationTimer, setEmailValidationTimer] = useState(null);

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", 
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail && showSidebar) { 
      setLoginData(prev => ({ ...prev, correoUsuario: rememberedEmail }));
      setRememberMe(true);
    }
    return () => {
      if (emailValidationTimer) clearTimeout(emailValidationTimer);
    };
  }, [showSidebar]);

  const validateEmail = (email) => email && email.includes("@");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });

    if (name === "correoUsuario" && value && !validateEmail(value)) {
      if (value.length > 3) {
        clearTimeout(emailValidationTimer);
        const timer = setTimeout(() => {
          showSnackbar("Debe incluir un signo '@' en la dirección de correo electrónico.", "info");
        }, 1000);
        setEmailValidationTimer(timer);
      }
    }
  };

  const login = async (e) => {
    e.preventDefault();
    if (!loginData.correoUsuario || !loginData.contraseniaUsuario) {
      showSnackbar("Por favor completa todos los campos requeridos.", "info");
      return;
    }
    if (!validateEmail(loginData.correoUsuario)) {
        showSnackbar("Debe incluir un signo '@' en la dirección de correo electrónico.", "info");
        return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/usuario/login", loginData);
      setIsLoading(false);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("correoUsuario", response.data.correoUsuario);
        localStorage.setItem("nombreUsuario", response.data.nombreUsuario);
        // Se encripta
        setEncryptedLocalStorage("nombreRol", response.data.rol.nombreRol); 
        localStorage.setItem("idUsuario", response.data.idUsuario);

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", loginData.correoUsuario);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        updateUserStatus();
        handleShowSidebar(); 

        if (response.data.rol.nombreRol === "Administrador" || response.data.rol.nombreRol === "Gerente") {
          navigate("/principal");
        } else { 
          navigate("/"); 
          
        }
      } else {
        showSnackbar("Credenciales no válidas", "info");
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || error.response?.data || "Error en el ingreso";
      showSnackbar(errorMsg, "info");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!loginData.correoUsuario) {
      showSnackbar("Ingresa tu correo electrónico.", "info");
      return;
    }
    if (!validateEmail(loginData.correoUsuario)) {
      showSnackbar("Formato de correo inválido.", "info");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/usuario/verificarCambioContrasena", {
        correoUsuario: loginData.correoUsuario,
      });
      if (response.status === 200) {
        showSnackbar("Código enviado con éxito.", "succes");
        navigate("/ResetPassword", { state: { correoUsuario: loginData.correoUsuario } });
        handleShowSidebar();
      }
    } catch (error) {
      const errorMsg = error.response?.data || "Error al enviar el código.";
      showSnackbar(errorMsg, "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showSidebar) {
      setLoginData({ correoUsuario: localStorage.getItem("rememberedEmail") || "", contraseniaUsuario: "" });
      setShowForgotPassword(false);
      setIsLoading(false);
    } else if (showForgotPassword){
       setLoginData(prev => ({ ...prev, contraseniaUsuario: "" }));
    }
  }, [showSidebar, showForgotPassword]);

  return (
    <Offcanvas show={showSidebar} onHide={handleShowSidebar} placement="end" className="login-sidebar">
      <Offcanvas.Header closeButton className="login-header">
        <Offcanvas.Title className="login-title">
          {showForgotPassword ? "Recuperar contraseña" : "Iniciar sesión"}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!showForgotPassword ? (
          <div className="auth-form-container">
            <form onSubmit={login}>
              <div className="form-group">
                <label htmlFor="authOffcanvasCorreoUsuario">Correo electrónico</label>
                <input
                  id="authOffcanvasCorreoUsuario"
                  type="email"
                  name="correoUsuario"
                  value={loginData.correoUsuario}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="authOffcanvasContraseniaUsuario">Contraseña</label>
                <div className="password-input-container">
                  <input
                    id="authOffcanvasContraseniaUsuario"
                    type={showPassword ? "text" : "password"}
                    name="contraseniaUsuario"
                    value={loginData.contraseniaUsuario}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu contraseña"
                    className="form-control"
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="options-container">

                <button
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                  type="button"
                >
                  ¿Perdiste tu contraseña?
                </button>
              </div>
              <button className="btn-acceso" disabled={isLoading} type="submit">
                {isLoading ? (<><FaSpinner className="spinner" /><span>Accediendo...</span></>) : "Acceso"}
              </button>
              <div className="create-account-section">
                <div className="divider"><span>O</span></div>
                <div className="user-icon-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z" />
                  </svg>
                </div>
                <p className="no-account-text">¿Aún no tienes cuenta?</p>
                <button type="button" className="btn-crear-cuenta" onClick={() => { navigate('/register'); handleShowSidebar(); }}>
                  Crear una cuenta
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="auth-form-container">
            <div className="reset-message">
              <p>Ingresa tu correo para verificar que eres tú. Te enviaremos un código para restablecer tu contraseña.</p>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="authOffcanvasForgotCorreo">Correo electrónico</label>
                <input
                  id="authOffcanvasForgotCorreo"
                  type="email"
                  name="correoUsuario"
                  value={loginData.correoUsuario}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn-acceso" disabled={isLoading}>
                {isLoading ? (<><FaSpinner className="spinner" /><span>Enviando...</span></>) : "Enviar código"}
              </button>
            </form>
            <button type="button" className="btn-volver" onClick={() => setShowForgotPassword(false)}>
              <FaArrowLeft /> Volver al inicio de sesión
            </button>
          </div>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default AuthOffcanvas;