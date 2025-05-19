import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheck, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const GestionarUsuarioForm = () => {
  const [users, setUsers] = useState([
    {
      idUsuario: 1,
      nombreUsuario: 'John',
      primerApellido: 'Doe',
      segundoApellido: 'Smith',
      correoUsuario: 'john.doe@example.com',
      contrasenaUsuario: '',
      confirmPassword: ''
    }
  ]);

  const [search, setSearch] = useState('');
  const [userEdit, setUserEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = (idUsuario) => {
    const filteredUsers = users.filter(user => user.idUsuario !== idUsuario);
    setUsers(filteredUsers);
  };

  const handleShowModal = (user = null) => {
    setUserEdit(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUserEdit(null);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (userEdit) {
      setUsers(users.map(u => u.idUsuario === userEdit.idUsuario ? userEdit : u));
    } else {
      const newUser = {
        idUsuario: users.length + 1,
        nombreUsuario: '',
        primerApellido: '',
        segundoApellido: '',
        correoUsuario: '',
        contrasenaUsuario: '',
        confirmPassword: ''
      };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const filteredUsers = users.filter(user =>
    user.nombreUsuario.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h1>Gestión de Usuarios</h1>
      <button className="btn btn-primary" onClick={() => handleShowModal()}>Agregar Nuevo Usuario</button>
      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{userEdit ? 'Actualizar Usuario' : 'Agregar Usuario'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUser}>
                  <div className="mb-3">
                    <input
                      className="form-control form-control-user"
                      type="email"
                      id="email"
                      placeholder="Correo Electrónico"
                      required
                      value={userEdit ? userEdit.correoUsuario : ''}
                      onChange={(e) => setUserEdit({ ...userEdit, correoUsuario: e.target.value })}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 col-md-4 mb-3 mb-sm-0">
                      <input
                        className="form-control form-control-user"
                        type="text"
                        placeholder="Nombre"
                        required
                        value={userEdit ? userEdit.nombreUsuario : ''}
                        onChange={(e) => setUserEdit({ ...userEdit, nombreUsuario: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6 col-md-4">
                      <input
                        className="form-control form-control-user"
                        type="text"
                        placeholder="Primer apellido"
                        required
                        value={userEdit ? userEdit.primerApellido : ''}
                        onChange={(e) => setUserEdit({ ...userEdit, primerApellido: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6 col-md-4">
                      <input
                        className="form-control form-control-user"
                        type="text"
                        placeholder="Segundo apellido"
                        required
                        value={userEdit ? userEdit.segundoApellido : ''}
                        onChange={(e) => setUserEdit({ ...userEdit, segundoApellido: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-6 mb-3 mb-sm-0">
                      <input
                        className="form-control form-control-user"
                        type="password"
                        id="password"
                        placeholder="Contraseña"
                        required
                        value={userEdit ? userEdit.contrasenaUsuario : ''}
                        onChange={(e) => setUserEdit({ ...userEdit, contrasenaUsuario: e.target.value })}
                      />
                    </div>
                    <div className="col-sm-6">
                      <input
                        className="form-control form-control-user"
                        type="password"
                        id="verifyPassword"
                        placeholder="Confirmar contraseña"
                        required
                        value={userEdit ? userEdit.confirmPassword : ''}
                        onChange={(e) => setUserEdit({ ...userEdit, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit">
                    {userEdit ? 'Actualizar Usuario' : 'Registrar Usuario'}
                  </button>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="col-md-10 search-table-col" style={{ paddingTop: '0px', marginTop: '50px', marginLeft: '50px' }}>
        <div className="form-group pull-right col-lg-4">
          <input
            type="text"
            className="search form-control"
            placeholder="Buscar por nombre"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="table-responsive table table-hover table-bordered results">
          <table className="table table-hover table-bordered">
            <thead className="bill-header cs">
              <tr>
                <th className="col-lg-1">No.</th>
                <th className="col-lg-2">Nombre</th>
                <th className="col-lg-3">Primer apellido</th>
                <th className="col-lg-2">Segundo apellido</th>
                <th className="col-lg-2">Correo</th>
                <th className="col-lg-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr className="warning no-result">
                  <td colSpan="8" className="text-center">
                    <FaExclamationTriangle /> No Result !!!
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.idUsuario}>
                    <td>{index + 1}</td>
                    <td>{user.nombreUsuario}</td>
                    <td>{user.primerApellido}</td>
                    <td>{user.segundoApellido}</td>
                    <td>{user.correoUsuario}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        type="button"
                        onClick={() => handleShowModal(user)}
                      >
                        <FaCheck style={{ fontSize: '15px' }} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => handleDelete(user.idUsuario)}
                      >
                        <FaTrash style={{ fontSize: '15px' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionarUsuarioForm;
