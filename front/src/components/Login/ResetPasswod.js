import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import './ResetPassword.css';
import FooterApp from '../Footer/FooterApp';
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { correoUsuario } = location.state || { correoUsuario: '' };
  
  const inputRef0 = useRef(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const inputRef4 = useRef(null);
  const inputRef5 = useRef(null);
  
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3, inputRef4, inputRef5];

  const [form, setForm] = useState({
    codigoVerificacion: Array(6).fill(''),
    nuevaContrasenia: '',
    confirmarContrasenia: '',
  });

  const [showPassword, setShowPassword] = useState({
    nueva: false,
    confirmar: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Ingrese una contraseña'
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const handleCodigoChange = (index, value) => {
    if (value.length <= 1) {
      const newCodigo = [...form.codigoVerificacion];
      newCodigo[index] = value.replace(/\D/, '');
      
      setForm({
        ...form,
        codigoVerificacion: newCodigo,
      });
      
      if (value && index < 5) {
        inputRefs[index + 1].current.focus();
      }
    } else {
      const digits = value.split('').filter(char => /\d/.test(char)).slice(0, 6);
      const newCodigo = [...form.codigoVerificacion];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCodigo[index + i] = digit;
        }
      });
      
      setForm({
        ...form,
        codigoVerificacion: newCodigo,
      });
      
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        inputRefs[nextIndex].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !form.codigoVerificacion[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    const newCodigo = [...form.codigoVerificacion];
    for (let i = 0; i < pasteData.length; i++) {
      if (i < 6) {
        newCodigo[i] = pasteData[i];
      }
    }
    
    setForm({
      ...form,
      codigoVerificacion: newCodigo,
    });
    
    const focusIndex = Math.min(pasteData.length, 5);
    if (focusIndex < 6) {
      inputRefs[focusIndex].current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    
    if (name === 'nuevaContrasenia') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = 'Muy débil';
    
    if (password.length === 0) {
      setPasswordStrength({ score: 0, message: 'Ingrese una contraseña' });
      return;
    }
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score >= 6) message = 'Muy fuerte';
    else if (score >= 4) message = 'Fuerte';
    else if (score >= 3) message = 'Media';
    else if (score >= 2) message = 'Débil';
    
    setPasswordStrength({ score, message });
  };

  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score >= 6) return '#0f3e1a';
    if (score >= 4) return '#377622';
    if (score >= 3) return '#9fc45a';
    if (score >= 2) return '#958932';
    return '#875725';
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasTwoLetters = (password.match(/[a-zA-Z]/g) || []).length >= 2;
    return minLength && hasTwoLetters;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const codigoCompleto = form.codigoVerificacion.join('');

    if (codigoCompleto.length !== 6) {
      handleOpenSnackbar('Por favor, ingresa los 6 dígitos del código', 'error');
      setIsSubmitting(false);
      return;
    }

    if (form.nuevaContrasenia !== form.confirmarContrasenia) {
      handleOpenSnackbar('Las contraseñas no coinciden', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(form.nuevaContrasenia)) {
      handleOpenSnackbar('La contraseña debe tener al menos 8 caracteres y 2 letras', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/usuario/cambiarContrasena', {
        numCodigo: codigoCompleto,
        nuevaContrasenia: form.nuevaContrasenia,
      });

      if (response.status === 200) {
        handleOpenSnackbar('¡Contraseña cambiada con éxito!', 'success');
        setTimeout(() => {
          navigate('/principal');
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        handleOpenSnackbar('Código incorrecto o inexistente', 'error');
      } else {
        handleOpenSnackbar('Error al cambiar la contraseña', 'error');
      }
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!correoUsuario) {
      handleOpenSnackbar('No se encontró el correo electrónico', 'error');
      return;
    }

    setIsResendingCode(true);

    try {
      const response = await axios.post("http://localhost:8080/usuario/verificarCambioContrasena", {
        correoUsuario: correoUsuario,
      });

      if (response.status === 200) {
        handleOpenSnackbar('Código de verificación enviado con éxito', 'success');
        
        setForm(prev => ({
          ...prev,
          codigoVerificacion: Array(6).fill('')
        }));
      }
    } catch (error) {
      if (error.response && error.response.data) {
        handleOpenSnackbar(error.response.data, 'error');
      } else {
        handleOpenSnackbar('Error al enviar el código de verificación', 'error');
      }
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleOpenSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="body-reset-password">
      <div className="reset-container">
        <div className="reset-form-container">
          <div className="text-center">
            <div className="reset-icon-container">
              <FaShieldAlt size={30} />
            </div>
            <h3 className="reset-title">Cambiar Contraseña</h3>
            {correoUsuario && (
              <p className="reset-subtitle">Hemos enviado un código de verificación a <strong>{correoUsuario}</strong></p>
            )}
          </div>
          
          <form onSubmit={handleResetPassword}>
            <div className="verification-code-section">
              <label className="form-label text-center" htmlFor="codigoVerificacion">
                Ingresa el código de verificación
              </label>
              <div className="verification-code-container">
                {form.codigoVerificacion.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    className="verification-digit"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodigoChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    required
                  />
                ))}
              </div>
              <p className="verification-help">
                No recibiste el código? <span 
                  className="resend-link" 
                  onClick={handleResendCode}
                  style={{ 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    opacity: isResendingCode ? 0.7 : 1
                  }}
                >
                  {isResendingCode ? 'Enviando...' : 'Reenviar código'}
                </span>
              </p>
            </div>
            
            <div className="form-section">
              <div className="password-field">
                <label className="form-label" htmlFor="nuevaContrasenia">
                  Nueva Contraseña
                </label>
                <div className="password-input-container">
                  <input
                    className="form-control"
                    type={showPassword.nueva ? "text" : "password"}
                    name="nuevaContrasenia"
                    placeholder="Ingresa tu nueva contraseña"
                    value={form.nuevaContrasenia}
                    onChange={handleChange}
                    required
                  />
                  <span 
                    className="password-toggle" 
                    onClick={() => togglePasswordVisibility('nueva')}
                  >
                    {showPassword.nueva ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                
                {form.nuevaContrasenia && (
                  <div className="password-strength">
                    <div className="strength-bar-container">
                      <div 
                        className="strength-bar" 
                        style={{ 
                          width: `${Math.min((passwordStrength.score/6) * 100, 100)}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                      {passwordStrength.message}
                    </span>
                  </div>
                )}
                
                <ul className="password-requirements">
                  <li className={form.nuevaContrasenia.length >= 8 ? "met" : ""}>
                    Mínimo 8 caracteres
                  </li>
                  <li className={(form.nuevaContrasenia.match(/[a-zA-Z]/g) || []).length >= 2 ? "met" : ""}>
                    Al menos 2 letras (mayúsculas o minúsculas)
                  </li>
                </ul>
              </div>
              
              <div className="password-field">
                <label className="form-label" htmlFor="confirmarContrasenia">
                  Confirmar Contraseña
                </label>
                <div className="password-input-container">
                  <input
                    className="form-control"
                    type={showPassword.confirmar ? "text" : "password"}
                    name="confirmarContrasenia"
                    placeholder="Confirma tu nueva contraseña"
                    value={form.confirmarContrasenia}
                    onChange={handleChange}
                    required
                  />
                  <span 
                    className="password-toggle" 
                    onClick={() => togglePasswordVisibility('confirmar')}
                  >
                    {showPassword.confirmar ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                
                {form.nuevaContrasenia && form.confirmarContrasenia && (
                  <div className={`password-match ${form.nuevaContrasenia === form.confirmarContrasenia ? "match" : "no-match"}`}>
                    {form.nuevaContrasenia === form.confirmarContrasenia 
                      ? "✓ Las contraseñas coinciden" 
                      : "✗ Las contraseñas no coinciden"}
                  </div>
                )}
              </div>
            </div>
            
            <button
              className="reset-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <FaLock className="button-icon" /> Cambiar Contraseña
                </>
              )}
            </button>
            
            <div className="back-link" onClick={() => navigate('/')}>
              <FaArrowLeft className="back-icon" /> Volver al inicio de sesión
            </div>
          </form>
        </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <FooterApp />
    </div>
  );
}

export default ResetPassword;