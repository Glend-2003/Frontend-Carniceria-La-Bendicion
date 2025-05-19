import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./Registrar.css";
import FooterApp from '../Footer/FooterApp';

const Registrar = () => {
  const [formData, setFormData] = useState({
    correoUsuario: "",
    nombreUsuario: "",
    primerApellido: "",
    segundoApellido: "",
    contraseniaUsuario: "",
    verifyPassword: ""
  });
  
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    verify: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
    width: "0%"
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const navigate = useNavigate();

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const validateEmail = (email) => {
    const allowedDomains = [
      "gmail.com", "yahoo.com", "icloud.com", "hotmail.com", "outlook.com", 
      "live.com", "aol.com", "protonmail.com", "mail.com", "zoho.com",
      "yandex.com", "msn.com", "me.com", "gmx.com", "icloud.com"
    ];
    
    const regex = /^[a-zA-Z0-9._-]+@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
    
    if (!regex.test(email)) return false;
    
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };
  
  const validateLettersOnly = (text) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(text);
  };

  const validateForm = () => {
    const errors = {};
    const { correoUsuario, nombreUsuario, primerApellido, segundoApellido, contraseniaUsuario, verifyPassword } = formData;
    
    if (!correoUsuario) {
      errors.correoUsuario = "El correo electrónico es obligatorio";
    } else if (!validateEmail(correoUsuario)) {
      errors.correoUsuario = "Por favor ingrese un correo electrónico válido";
    }
    
    if (!nombreUsuario) {
      errors.nombreUsuario = "El nombre es obligatorio";
    } else if (!validateLettersOnly(nombreUsuario)) {
      errors.nombreUsuario = "El nombre solo debe contener letras";
    }
    
    if (!primerApellido) {
      errors.primerApellido = "El primer apellido es obligatorio";
    } else if (!validateLettersOnly(primerApellido)) {
      errors.primerApellido = "El apellido solo debe contener letras";
    }
    
    if (!segundoApellido) {
      errors.segundoApellido = "El segundo apellido es obligatorio";
    } else if (!validateLettersOnly(segundoApellido)) {
      errors.segundoApellido = "El apellido solo debe contener letras";
    }
    
    if (!contraseniaUsuario) {
      errors.contraseniaUsuario = "La contraseña es obligatoria";
    } else if (contraseniaUsuario.length < 8) {
      errors.contraseniaUsuario = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[A-Za-z]{2,})/.test(contraseniaUsuario)) {
      errors.contraseniaUsuario = "La contraseña debe contener al menos 2 letras";
    }
    
    if (!verifyPassword) {
      errors.verifyPassword = "Por favor confirme la contraseña";
    } else if (verifyPassword !== contraseniaUsuario) {
      errors.verifyPassword = "Las contraseñas no coinciden";
    }
    
    return errors;
  };

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    
    if (!password) {
      return {
        score: 0,
        label: "",
        color: "",
        width: "0%",
        strengthClass: ""
      };
    }
    
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    let label, color, width, strengthClass;
    
    switch (true) {
      case (score <= 2):
        label = "Débil";
        color = "var(--color-brown)"; 
        width = "33%";
        strengthClass = "strength-weak";
        break;
      case (score <= 4):
        label = "Media";
        color = "var(--color-light-green)"; 
        width = "66%";
        strengthClass = "strength-medium";
        break;
      default:
        label = "Fuerte";
        color = "var(--color-dark-green)"; 
        width = "100%";
        strengthClass = "strength-strong";
    }
    
    return { score, label, color, width, strengthClass };
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (id === "contraseniaUsuario") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
    
    let error = "";
    
    if (id === "nombreUsuario" || id === "primerApellido" || id === "segundoApellido") {
      if (value && !validateLettersOnly(value)) {
        error = "Solo se permiten letras en este campo";
      }
    }
    
    if (id === "correoUsuario" && value) {
      if (!validateEmail(value)) {
        error = "Por favor ingrese un correo electrónico válido";
      }
    }
    
    if (error) {
      setFormErrors(prev => ({ ...prev, [id]: error }));
      if (id === "correoUsuario" && value.includes("@") && !validateEmail(value)) {
        showSnackbar("Formato de correo inválido. Verifique el dominio.", "error");
      }
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleGoBack = () => {
    navigate("../");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showSnackbar("Por favor, complete correctamente todos los campos", "error");
      return;
    }

    const { correoUsuario, nombreUsuario, primerApellido, segundoApellido, contraseniaUsuario } = formData;
    const registroData = {
      correoUsuario,
      nombreUsuario,
      primerApellido,
      segundoApellido,
      contraseniaUsuario
    };

    axios
      .post("http://localhost:8080/usuario/registrar", registroData)
      .then((response) => {
        console.log("Usuario registrado con éxito:", response.data);
        showSnackbar("¡Usuario registrado con éxito! Redirigiendo...", "success");
        setTimeout(() => {
          navigate("../");
        }, 2000);
      })
      .catch((error) => {
        console.error("Error al registrar usuario:", error);
        
        if (error.response) {
          const errorMessage = error.response.data.message || "Error al registrar usuario";
          showSnackbar(errorMessage, "error");
        } else if (error.request) {
          showSnackbar("No se pudo contactar con el servidor", "error");
        } else {
          showSnackbar("Error en la solicitud", "error");
        }
      });
  };

  return (
    <div className="registrar-page">
      <div className="registrar-container">
        <div className="registro-card">
          <div className="registro-header">
            <div className="shield-icon"></div>
            <h4>Crear Nueva Cuenta</h4>
          </div>
          
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correoUsuario">Correo Electrónico</label>
                <input
                  type="email"
                  id="correoUsuario"
                  className={`form-control ${formErrors.correoUsuario ? "is-invalid" : ""}`}
                  value={formData.correoUsuario}
                  onChange={handleInputChange}
                  placeholder="ejemplo@dominio.com"
                />
                {formErrors.correoUsuario && <div className="invalid-feedback">{formErrors.correoUsuario}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombreUsuario">Nombre</label>
                <input
                  type="text"
                  id="nombreUsuario"
                  className={`form-control ${formErrors.nombreUsuario ? "is-invalid" : ""}`}
                  value={formData.nombreUsuario}
                  onChange={handleInputChange}
                  placeholder="Sólo letras"
                />
                {formErrors.nombreUsuario && <div className="invalid-feedback">{formErrors.nombreUsuario}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="primerApellido">Primer Apellido</label>
                <input
                  type="text"
                  id="primerApellido"
                  className={`form-control ${formErrors.primerApellido ? "is-invalid" : ""}`}
                  value={formData.primerApellido}
                  onChange={handleInputChange}
                  placeholder="Sólo letras"
                />
                {formErrors.primerApellido && <div className="invalid-feedback">{formErrors.primerApellido}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="segundoApellido">Segundo Apellido</label>
                <input
                  type="text"
                  id="segundoApellido"
                  className={`form-control ${formErrors.segundoApellido ? "is-invalid" : ""}`}
                  value={formData.segundoApellido}
                  onChange={handleInputChange}
                  placeholder="Sólo letras"
                />
                {formErrors.segundoApellido && <div className="invalid-feedback">{formErrors.segundoApellido}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contraseniaUsuario">Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={passwordVisibility.password ? "text" : "password"}
                    id="contraseniaUsuario"
                    className={`form-control ${formErrors.contraseniaUsuario ? "is-invalid" : ""}`}
                    value={formData.contraseniaUsuario}
                    onChange={handleInputChange}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    <span className={`eye-icon ${passwordVisibility.password ? "eye-slash" : ""}`}></span>
                  </button>
                </div>
                {formErrors.contraseniaUsuario && <div className="invalid-feedback">{formErrors.contraseniaUsuario}</div>}
                
                {formData.contraseniaUsuario && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <div style={{ 
                        height: '8px', 
                        width: '100%', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          width: passwordStrength.width, 
                          backgroundColor: passwordStrength.color,
                          transition: 'width 0.3s ease, background-color 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ 
                        marginLeft: '10px', 
                        color: passwordStrength.color,
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="password-requirements">
                  <span>• Mínimo 8 caracteres</span>
                  <span>• Al menos 2 letras (mayúsculas o minúsculas)</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="verifyPassword">Confirmar Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={passwordVisibility.verify ? "text" : "password"}
                    id="verifyPassword"
                    className={`form-control ${formErrors.verifyPassword ? "is-invalid" : ""}`}
                    value={formData.verifyPassword}
                    onChange={handleInputChange}
                    placeholder="Repita la contraseña"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('verify')}
                  >
                    <span className={`eye-icon ${passwordVisibility.verify ? "eye-slash" : ""}`}></span>
                  </button>
                </div>
                {formErrors.verifyPassword && <div className="invalid-feedback">{formErrors.verifyPassword}</div>}
              </div>
            </div>
            
            <button type="submit" className="btn-registrar">
              Crear Cuenta
            </button>
            
            <div className="return-link">
              <span onClick={handleGoBack}>
                <span className="arrow-left-icon"></span>
                Volver al inicio de sesión
              </span>
            </div>
          </form>
        </div>
      </div>
      
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
    </div>
  );
};

export default Registrar;