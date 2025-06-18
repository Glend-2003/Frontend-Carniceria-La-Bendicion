import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaKey, FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import SideBar from "../SideBar/SideBar";
import { Button, Modal } from "react-bootstrap";
import "./Usuarios.css";
import FooterApp from "../Footer/FooterApp";
import PaginacionApp from "../Paginacion/PaginacionApp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const GestionarUsuario = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userEdit, setUserEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { usuario } = useAuth();
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("Todos");
  const itemsPerPage = 5;
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
    width: "0%"
  });
  const [formErrors, setFormErrors] = useState({});

  const [correoUsuario, setCorreoUsuario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [idRol, setIdRol] = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    const hasMinLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || (!hasLetters && hasNumbers) || (hasLetters && !hasNumbers)) {
      strength = 33;
    }
    else if (hasLetters && hasNumbers && !hasSpecialChars) {
      strength = 66;
    }
    else if (hasLetters && hasNumbers && hasSpecialChars) {
      strength = 100;
    }

    setPasswordStrength(strength);
  }, [password]);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:8080/usuario/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
      toast.error("Ocurrió un error al cargar los usuarios");
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await axios.get("http://localhost:8080/rol/");
      setRoles(response.data);
    } catch (error) {
      console.error("Error al cargar los roles:", error);
      toast.error("Ocurrió un error al cargar los roles");
    }
  };

  const validateEmail = (email) => {
    const allowedDomains = [
      "gmail.com", "yahoo.com", "icloud.com", "hotmail.com", "outlook.com",
      "live.com", "aol.com", "protonmail.com", "mail.com", "zoho.com",
      "yandex.com", "msn.com", "me.com", "gmx.com"
    ];
    const regex = /^[a-zA-Z0-9._-]+@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
    if (!regex.test(email)) return false;
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const validateLettersOnly = (text) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(text);
  };

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    if (!password) {
      return { score: 0, label: "", color: "", width: "0%" };
    }
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label, color, width;
    switch (true) {
      case (score <= 2):
        label = "Débil";
        color = "#875725";
        width = "33%";
        break;
      case (score <= 4):
        label = "Media";
        color = "#9fc45a";
        width = "66%";
        break;
      default:
        label = "Fuerte";
        color = "#387623";
        width = "100%";
    }
    return { score, label, color, width };
  };

  const validarFormulario = () => {
    const errors = {};
    if (
      !correoUsuario.trim() ||
      !nombreUsuario.trim() ||
      !primerApellido.trim() ||
      !segundoApellido.trim() ||
      !idRol
    ) {
      toast.error("Todos los campos marcados son obligatorios");
      return false;
    }
    if (!validateEmail(correoUsuario)) {
      errors.correoUsuario = "El formato del correo electrónico es incorrecto";
      toast.error(errors.correoUsuario);
      return false;
    }
    if (!validateLettersOnly(nombreUsuario)) {
      errors.nombreUsuario = "El nombre solo debe contener letras";
      toast.error(errors.nombreUsuario);
      return false;
    }
    if (!validateLettersOnly(primerApellido)) {
      errors.primerApellido = "El primer apellido solo debe contener letras";
      toast.error(errors.primerApellido);
      return false;
    }
    if (!validateLettersOnly(segundoApellido)) {
      errors.segundoApellido = "El segundo apellido solo debe contener letras";
      toast.error(errors.segundoApellido);
      return false;
    }

    if (!userEdit?.idUsuario) {
      if (!password) {
        errors.password = "La contraseña es obligatoria para nuevos usuarios";
        toast.error(errors.password);
        return false;
      }
      if (password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres";
        toast.error(errors.password);
        return false;
      }
      if (!/(?=.*[A-Za-z]{2,})/.test(password)) {
        errors.password = "La contraseña debe contener al menos 2 letras";
        toast.error(errors.password);
        return false;
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
        toast.error(errors.confirmPassword);
        return false;
      }
    } else if (password) {
      if (password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres";
        toast.error(errors.password);
        return false;
      }
      if (!/(?=.*[A-Za-z]{2,})/.test(password)) {
        errors.password = "La contraseña debe contener al menos 2 letras";
        toast.error(errors.password);
        return false;
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
        toast.error(errors.confirmPassword);
        return false;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleShowModal = (user = null) => {
    setFormErrors({});
    if (user) {
      setUserEdit(user);
      setCorreoUsuario(user.correoUsuario);
      setNombreUsuario(user.nombreUsuario);
      setPrimerApellido(user.primerApellido);
      setSegundoApellido(user.segundoApellido);
      setIdRol(user.rol.idRol);
      setPassword("");
      setConfirmPassword("");
      setPasswordStrength({ score: 0, label: "", color: "", width: "0%" });
    } else {
      setUserEdit(null);
      setCorreoUsuario("");
      setNombreUsuario("");
      setPrimerApellido("");
      setSegundoApellido("");
      setIdRol("");
      setPassword("");
      setConfirmPassword("");
      setPasswordStrength({ score: 0, label: "", color: "", width: "0%" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUserEdit(null);
    setCorreoUsuario("");
    setNombreUsuario("");
    setPrimerApellido("");
    setSegundoApellido("");
    setIdRol("");
    setPassword("");
    setConfirmPassword("");
    setFormErrors({});
    setPasswordStrength({ score: 0, label: "", color: "", width: "0%" });
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case "correoUsuario":
        setCorreoUsuario(value);
        if (value && !validateEmail(value)) {
          setFormErrors(prev => ({ ...prev, correoUsuario: "Por favor ingrese un correo electrónico válido" }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.correoUsuario;
            return newErrors;
          });
        }
        break;
      case "nombreUsuario":
        setNombreUsuario(value);
        if (value && !validateLettersOnly(value)) {
          setFormErrors(prev => ({ ...prev, nombreUsuario: "El nombre solo debe contener letras" }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.nombreUsuario;
            return newErrors;
          });
        }
        break;
      case "primerApellido":
        setPrimerApellido(value);
        if (value && !validateLettersOnly(value)) {
          setFormErrors(prev => ({ ...prev, primerApellido: "El apellido solo debe contener letras" }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.primerApellido;
            return newErrors;
          });
        }
        break;
      case "segundoApellido":
        setSegundoApellido(value);
        if (value && !validateLettersOnly(value)) {
          setFormErrors(prev => ({ ...prev, segundoApellido: "El apellido solo debe contener letras" }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.segundoApellido;
            return newErrors;
          });
        }
        break;
      case "idRol":
        setIdRol(value);
        break;
      case "password":
        setPassword(value);
        setPasswordStrength(evaluatePasswordStrength(value));
        if (value) {
          if (value.length < 8) {
            setFormErrors(prev => ({ ...prev, password: "La contraseña debe tener al menos 8 caracteres" }));
          } else if (!/(?=.*[A-Za-z]{2,})/.test(value)) {
            setFormErrors(prev => ({ ...prev, password: "La contraseña debe contener al menos 2 letras" }));
          } else {
            setFormErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.password;
              return newErrors;
            });
          }
          if (confirmPassword && value !== confirmPassword) {
            setFormErrors(prev => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
          } else if (confirmPassword) {
            setFormErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.confirmPassword;
              return newErrors;
            });
          }
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.password;
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        if (password && value !== password) {
          setFormErrors(prev => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const userData = {
      correoUsuario,
      nombreUsuario,
      primerApellido,
      segundoApellido,
      rol: {
        idRol: parseInt(idRol)
      }
    };

    if (password) {
      userData.contraseniaUsuario = password;
    }

    if (userEdit?.idUsuario) {
      userData.idUsuario = userEdit.idUsuario;
      userData.estadoUsuario = userEdit.estadoUsuario; 
      userData.telefonoUsuario = userEdit.telefonoUsuario;
    }

    try {
      if (userEdit?.idUsuario) {
        await axios.put("http://localhost:8080/usuario/actualizar", userData);
        toast.success("Usuario actualizado con éxito");
      } else {
        await axios.post("http://localhost:8080/usuario/registrar", userData);
        toast.success("Usuario agregado con éxito");
      }
      cargarUsuarios();
      handleCloseModal();
    } catch (error) {
      console.error("Error al procesar el usuario:", error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || "Ocurrió un error al procesar el usuario");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDelete = async (idUsuario) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
      confirmButtonColor: "#387623", 
      cancelButtonColor: "#875725",
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/usuario/eliminar/${idUsuario}`);
      toast.success("Usuario eliminado con éxito");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Ocurrió un error al eliminar el usuario");
    }
  };

  const activarDesactivarUsuario = async (id) => {
    try {
      await axios.put(`http://localhost:8080/usuario/activar/${id}`);
      toast.success("Cambio realizado con éxito.");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al realizar el cambio:", error);
      toast.error("Ocurrió un error al cambiar el estado del usuario.");
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredUsers = users.filter((user) =>
    (user.nombreUsuario && user.nombreUsuario.toLowerCase().includes(search.toLowerCase())) ||
    (user.correoUsuario && user.correoUsuario.toLowerCase().includes(search.toLowerCase()))
  );

  const uniqueRoles = ["Todos", ...new Set(roles.map((rol) => rol.nombreRol))];

  const filteredData =
    selectedRole === "Todos"
      ? filteredUsers
      : filteredUsers.filter((user) => user.rol.nombreRol === selectedRole);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentUsers = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showAlertaInactivo = () => {
    Swal.fire({
      title: "Usuario inactivo",
      text: "No puedes editar un usuario inactivo.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }

  return (
    <div className="usuario-container">
      <SideBar usuario={usuario} />
      <div className="usuario-main-container">
        <h1>Gestión de usuarios</h1>
        <Button className="usuario-add-button" onClick={() => handleShowModal()}>
          Agregar usuario nuevo
        </Button>

        <div className="usuario-search-container">
          <label>Buscar por rol</label>
          <select
            id="roleFilter"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1); 
            }}
            className="form-control mb-3"
          >
            {uniqueRoles.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>
        </div>

        <div className="usuario-search-container">
          <label>Buscar usuario</label>
          <input
            type="text"
            className="usuario-search-input"
            placeholder="Buscar usuario por nombre o correo"
            value={search}
            onChange={(e) => {
              handleSearchChange(e);
              setCurrentPage(1);
            }}
          />
        </div>

        <Modal show={showModal} onHide={handleCloseModal} className="usuario-modal" size="lg" centered>
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>
              {userEdit ? "Actualizar Usuario" : "Agregar Usuario"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="correoUsuario">Correo Electrónico <span className="text-danger">*</span></label>
                    <input
                      id="correoUsuario"
                      className={`form-control ${formErrors.correoUsuario ? "is-invalid" : ""}`}
                      type="email"
                      placeholder="Correo electrónico"
                      required
                      value={correoUsuario}
                      onChange={(e) => handleInputChange("correoUsuario", e.target.value)}
                    />
                    {formErrors.correoUsuario && (
                      <div className="invalid-feedback">{formErrors.correoUsuario}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="nombreUsuario">Nombre <span className="text-danger">*</span></label>
                    <input
                      id="nombreUsuario"
                      className={`form-control ${formErrors.nombreUsuario ? "is-invalid" : ""}`}
                      type="text"
                      placeholder="Nombre"
                      required
                      value={nombreUsuario}
                      onChange={(e) => handleInputChange("nombreUsuario", e.target.value)}
                    />
                    {formErrors.nombreUsuario && (
                      <div className="invalid-feedback">{formErrors.nombreUsuario}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="primerApellido">Primer Apellido <span className="text-danger">*</span></label>
                    <input
                      id="primerApellido"
                      className={`form-control ${formErrors.primerApellido ? "is-invalid" : ""}`}
                      type="text"
                      placeholder="Primer apellido"
                      required
                      value={primerApellido}
                      onChange={(e) => handleInputChange("primerApellido", e.target.value)}
                    />
                    {formErrors.primerApellido && (
                      <div className="invalid-feedback">{formErrors.primerApellido}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="rolUsuario">Rol del usuario <span className="text-danger">*</span></label>
                    <select
                      id="rolUsuario"
                      className="form-control"
                      required
                      value={idRol}
                      onChange={(e) => handleInputChange("idRol", e.target.value)}
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((rol) => (
                        <option key={rol.idRol} value={rol.idRol}>
                          {rol.nombreRol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="segundoApellido">Segundo Apellido <span className="text-danger">*</span></label>
                    <input
                      id="segundoApellido"
                      className={`form-control ${formErrors.segundoApellido ? "is-invalid" : ""}`}
                      type="text"
                      placeholder="Segundo apellido"
                      required
                      value={segundoApellido}
                      onChange={(e) => handleInputChange("segundoApellido", e.target.value)}
                    />
                    {formErrors.segundoApellido && (
                      <div className="invalid-feedback">{formErrors.segundoApellido}</div>
                    )}
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="contraseniaUsuario">
                      {userEdit ? "Nueva Contraseña (Dejar en blanco para mantener la actual)" : "Contraseña"}
                      {!userEdit && <span className="text-danger">*</span>}
                    </label>
                    <div className="position-relative">
                      <input
                        id="contraseniaUsuario"
                        className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                        type={passwordVisibility.password ? "text" : "password"}
                        placeholder="Contraseña"
                        required={!userEdit} 
                        value={password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none border-0"
                        style={{ right: "10px", zIndex: 5 }}
                        onClick={() => togglePasswordVisibility("password")}
                      >
                        <i className={`fa fa-${passwordVisibility.password ? "eye-slash" : "eye"}`}></i>
                      </button>
                    </div>
                    {formErrors.password && (
                      <div className="invalid-feedback d-block">{formErrors.password}</div>
                    )}
                    {password && (
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
                    <div className="mt-2" style={{ fontSize: '12px', color: '#6c757d' }}>
                      <span>• Mínimo 8 caracteres</span><br />
                      <span>• Al menos 2 letras (mayúsculas o minúsculas)</span>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="confirmarContrasenia">
                      {userEdit && password ? "Confirmar Nueva Contraseña" : (!userEdit ? "Confirmar Contraseña" : "Confirmar Contraseña (Si la cambió)")}
                      {(!userEdit || password) && <span className="text-danger">*</span>}
                    </label>
                    <div className="position-relative">
                      <input
                        id="confirmarContrasenia"
                        className={`form-control ${formErrors.confirmPassword ? "is-invalid" : ""}`}
                        type={passwordVisibility.confirm ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        required={!userEdit || !!password} 
                        value={confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        disabled={!password && !!userEdit} 
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none border-0"
                        style={{ right: "10px", zIndex: 5 }}
                        onClick={() => togglePasswordVisibility("confirm")}
                        disabled={!password && !!userEdit}
                      >
                        <i className={`fa fa-${passwordVisibility.confirm ? "eye-slash" : "eye"}`}></i>
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <div className="invalid-feedback d-block">{formErrors.confirmPassword}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button className="btn-submit" type="submit">
                  {userEdit ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <ToastContainer position="top-right" autoClose={3000} />

        <div className="usuario-table-container">
          <table className="usuario-table">
            <thead>
              <tr className="usuario-table-header-row">
                <th>No</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Teléfono Usuario</th>
                <th>Rol Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr className="usuario-no-results">
                  <td colSpan="6">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="usuario-warning-icon" size="lg" />
                    <span>No hay usuarios disponibles</span>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <tr key={user.idUsuario} className="usuario-table-row">
                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td>
                      <div className="usuario-letraComun">{user.nombreUsuario} {user.primerApellido} {user.segundoApellido}</div>
                    </td>
                    <td className="usuario-letraNegrita">{user.correoUsuario}</td>
                    <td className="usuario-letraComun">{user.telefonoUsuario || "Sin número registrado..."}</td>
                    <td className="usuario-roll">{user.rol.nombreRol}</td>
                    <td className="usuario-actions-cell">
                      <div className="usuario-actions-container">
                        <button
                          className={`usuario-status-button ${user.estadoUsuario ? "usuario-status-active" : "usuario-status-inactive"}`}
                          type="button"
                          onClick={() => activarDesactivarUsuario(user.idUsuario)}
                        >
                          {user.estadoUsuario ? "Activo" : "Inactivo"}
                        </button>
                        <div className="usuario-action-buttons">
                          <button
                            className="usuario-edit-button"
                            type="button"
                            onClick={() => {
                              if (!user.estadoUsuario) {
                                showAlertaInactivo();
                              } else {
                                handleShowModal(user);
                              }
                            }}
                            title="Editar usuario"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="usuario-delete-button"
                            type="button"
                            onClick={() => handleDelete(user.idUsuario)}
                            title="Eliminar usuario"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
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

export default GestionarUsuario;