import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { correoUsuario } = location.state || { correoUsuario: '' }; 

  const [form, setForm] = useState({
    codigoVerificacion: '',
    nuevaContrasenia: '',
    confirmarContrasenia: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.nuevaContrasenia !== form.confirmarContrasenia) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/usuario/cambiarContrasena", {
        numCodigo: form.codigoVerificacion,
        nuevaContrasenia: form.nuevaContrasenia,
      });
      if (response.status === 200) {
        toast.success("Contraseña cambiada con éxito");
        navigate('/login');
      }
    } catch (error) {
      toast.error("Error al cambiar la contraseña: " + error.message);
    }
  };

  return (
    <div className="text-center">
      <h3>Cambiar Contraseña</h3>
      <form onSubmit={handleResetPassword}>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            name="codigoVerificacion"
            placeholder="Código de verificación"
            value={form.codigoVerificacion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            name="nuevaContrasenia"
            placeholder="Nueva contraseña"
            value={form.nuevaContrasenia}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            name="confirmarContrasenia"
            placeholder="Confirmar nueva contraseña"
            value={form.confirmarContrasenia}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <button className="btn btn-primary d-block w-100" type="submit">
            Cambiar Contraseña
          </button>
        </div>
        <button
          className="btn btn-link"
          onClick={() => navigate('/login')}
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;