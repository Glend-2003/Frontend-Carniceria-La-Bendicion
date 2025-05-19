import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ loginData, setLoginData, login, handleInputChange }) => {
  const [form, setForm] = useState({
    correoUsuario: '',
    contraseniaUsuario: '',
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.correoUsuario || !form.contraseniaUsuario) {
      toast.error("Por favor, rellene todos los campos");
      return;
    }

    login(form);
    setForm({
      correoUsuario: '',
      contraseniaUsuario: '',
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.correoUsuario) {
      toast.error("Por favor, ingresa tu correo electrónico");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/usuario/verificarCambioContrasena", {
        correoUsuario: form.correoUsuario,
      });
      if (response.status === 200) {
        toast.success("Código enviado al correo");
        navigate('/ResetPassword', { state: { correoUsuario: form.correoUsuario } }); 
      }
    } catch (error) {
      toast.error("Error al enviar el código: " + error.message);
    }
  };

  return (
    <div className="text-center">
      {!showForgotPassword ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              name="correoUsuario"
              placeholder="Correo"
              value={form.correoUsuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              name="contraseniaUsuario"
              placeholder="Contraseña"
              value={form.contraseniaUsuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <button className="btn btn-primary d-block w-100" type="submit">
              Iniciar sesión
            </button>
          </div>
          <div className="form-check text-start mb-3">
            <input className="form-check-input" type="checkbox" id="rememberMe" />
            <label className="form-check-label" htmlFor="rememberMe">
              Acuérdate de mí
            </label>
            <button
              className="btn btn-link float-end text-muted"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleForgotPassword}>
          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              name="correoUsuario"
              placeholder="Ingresa tu correo"
              value={form.correoUsuario}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <button className="btn btn-primary d-block w-100" type="submit">
              Enviar Código
            </button>
          </div>
          <button
            className="btn btn-link"
            onClick={() => setShowForgotPassword(false)}
          >
            Volver al inicio de sesión
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;