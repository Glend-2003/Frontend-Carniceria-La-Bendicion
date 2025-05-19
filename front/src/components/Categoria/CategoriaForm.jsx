import React, { useState } from 'react';

const CategoriaForm = ({ onSubmit }) => {
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [descripcionCategoria, setDescripcionCategoria] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombreCategoria, descripcionCategoria });
    setNombreCategoria('');
    setDescripcionCategoria('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nombre de la Categoría</label>
        <input
          type="text"
          className="form-control"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Descripción de la Categoría</label>
        <textarea
          className="form-control"
          value={descripcionCategoria}
          onChange={(e) => setDescripcionCategoria(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary mt-3">Agregar Categoría</button>
    </form>
  );
};

export default CategoriaForm;
