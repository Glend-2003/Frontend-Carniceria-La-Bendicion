
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

const ProductoForm = ({ show, onHide, onSubmit, producto, categorias }) => {
  const [nombreProducto, setNombreProducto] = useState('');
  const [imgProducto, setImgProducto] = useState('');
  const [montoPrecioProducto, setMontoPrecioProducto] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [estadoProducto, setEstadoProducto] = useState(1);

  useEffect(() => {
    if (producto) {
      setNombreProducto(producto.nombreProducto || '');
      setImgProducto(producto.imgProducto || '');
      setMontoPrecioProducto(producto.montoPrecioProducto || '');
      setDescripcionProducto(producto.descripcionProducto || '');
      setIdCategoria(producto.idCategoria || '');
      setEstadoProducto(producto.estadoProducto || 1);
    } else {
      resetForm();
    }
  }, [producto]);

  const resetForm = () => {
    setNombreProducto('');
    setImgProducto('');
    setMontoPrecioProducto('');
    setDescripcionProducto('');
    setIdCategoria('');
    setEstadoProducto(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombreProducto.trim() || !descripcionProducto.trim() || !montoPrecioProducto || !idCategoria) {
      toast.error('Todos los campos son obligatorios y no pueden estar vacíos');
      return;
    }

    const newProducto = {
      idProducto: producto?.idProducto,
      nombreProducto: nombreProducto.trim(),
      imgProducto: imgProducto.trim(),
      montoPrecioProducto,
      descripcionProducto: descripcionProducto.trim(),
      idCategoria,
      estadoProducto
    };

    onSubmit(newProducto);
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Actualizar Producto' : 'Agregar Producto'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              placeholder="Nombre del Producto"
              required
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              placeholder="URL de Imagen del Producto"
              value={imgProducto}
              onChange={(e) => setImgProducto(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              className="form-control"
              type="number"
              placeholder="Precio del Producto"
              required
              value={montoPrecioProducto}
              onChange={(e) => setMontoPrecioProducto(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control"
              placeholder="Descripción del Producto"
              required
              value={descripcionProducto}
              onChange={(e) => setDescripcionProducto(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <select
              className="form-control"
              required
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.idCategoria} value={categoria.idCategoria}>
                  {categoria.nombreCategoria}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>
              <input
                type="checkbox"
                checked={estadoProducto === 1}
                onChange={(e) => setEstadoProducto(e.target.checked ? 1 : 0)}
              />
              {' '}Producto Activo
            </label>
          </div>
          <Button variant="primary" type="submit">
            {producto ? 'Actualizar' : 'Agregar'}
          </Button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductoForm;f
