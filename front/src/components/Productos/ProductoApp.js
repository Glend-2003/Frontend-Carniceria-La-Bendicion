import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faExclamationTriangle, faImage, faUpload } from "@fortawesome/free-solid-svg-icons";
import SideBar from "../SideBar/SideBar";
import useAuth from "../../hooks/useAuth";
import { Button, Modal, Spinner } from "react-bootstrap";
import FooterApp from '../Footer/FooterApp';
import "./Producto.css";
import PaginacionApp from "../Paginacion/PaginacionApp";
import useImageUpload from "../../hooks/useImageUpload"; 

const ProductoApp = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoEdit, setProductoEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();
  const [search, setSearch] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [montoPrecioProducto, setMontoPrecioProducto] = useState("");
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [unidadMedida, setUnidadMedida] = useState("Ud");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [stockProducto, setStockProducto] = useState(0);
  const [idCategoria, setIdCategoria] = useState("");
  const [estadoProducto, setEstadoProducto] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    imageFile,
    imagePreview,
    isCompressing,
    originalFileInfo,
    handleFileChange,
    clearImage,
    maxSizeMB
  } = useImageUpload({
    maxSizeMB: 5, 
    quality: 0.7, 
    onImageSelected: (file, preview) => {
      console.log(`Imagen seleccionada y procesada: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  });

  const unidadesMedida = ["Ud", "Kg", "Gr", "Lb", "Oz", "Lt", "Ml"];

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/producto/", {
        params: { estadoProducto: 0 }
      });
      const productos = response.data;

      for (let producto of productos) {
        if (producto.categoria && producto.categoria.idCategoria) {
          producto.nombreCategoria = producto.categoria.nombreCategoria;
        } else {
          producto.nombreCategoria = "Sin categoría";
        }
      }

      setProductos(productos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Ocurrió un error al cargar los productos");
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:8080/categoria/", {
        params: { estadoCategoria: 1 }
      });
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error("Ocurrió un error al cargar las categorías");
    }
  };

  const validarCamposProducto = () => {
    if (
      !nombreProducto.trim() ||
      !descripcionProducto.trim() ||
      cantidadProducto <= 0 ||
      !unidadMedida ||
      !codigoProducto.trim() ||
      stockProducto < 0 ||
      !montoPrecioProducto ||
      !idCategoria
    ) {
      toast.error("Todos los campos son obligatorios y no pueden estar vacíos");
      return false;
    }

    return true;
  };

  const agregarProducto = async () => {
    if (!validarCamposProducto()) return;
    
    if (isCompressing) {
      toast.info("Por favor espere mientras la imagen se procesa...");
      return;
    }

    const formData = new FormData();
    formData.append("nombreProducto", nombreProducto.trim());
    formData.append("montoPrecioProducto", montoPrecioProducto);
    formData.append("descripcionProducto", descripcionProducto.trim());
    formData.append("cantidadProducto", cantidadProducto);
    formData.append("tipoPesoProducto", unidadMedida);
    formData.append("codigoProducto", codigoProducto.trim());
    formData.append("stockProducto", stockProducto);
    formData.append("idCategoria", idCategoria);
    formData.append("estadoProducto", estadoProducto);

    if (imageFile) {
      formData.append("file", imageFile);
      try {
        console.log(`Enviando producto con imagen optimizada: ${imageFile.name} (${(imageFile.size / (1024 * 1024)).toFixed(2)} MB)`);
        
        const response = await axios.post("http://localhost:8080/producto/agregarConImagen", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        console.log("Respuesta del servidor:", response.data);
        toast.success("Producto agregado con éxito");
        
        clearImage();
      } catch (error) {
        console.error("Error al agregar producto con imagen:", error);
        
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          console.error("Estado HTTP:", error.response.status);
          
          if (error.response.status === 413) {
            toast.error(`Error: La imagen es demasiado grande. El servidor acepta un máximo de 10MB.`);
          } else {
            const mensaje = error.response.data.message || "Ocurrió un error al agregar el producto";
            toast.error(`Error: ${mensaje} (${error.response.status})`);
          }
        } else {
          toast.error("Ocurrió un error al agregar el producto. Comprueba la conexión al servidor.");
        }
        return;
      }
    } else {
      try {
        const productoData = {
          nombreProducto: nombreProducto.trim(),
          montoPrecioProducto,
          descripcionProducto: descripcionProducto.trim(),
          cantidadProducto,
          tipoPesoProducto: unidadMedida,
          codigoProducto: codigoProducto.trim(),
          stockProducto,
          idCategoria,
          estadoProducto,
        };
        console.log("Enviando producto sin imagen...");
        await axios.post("http://localhost:8080/producto/agregarProducto", productoData);
        toast.success("Producto agregado con éxito");
      } catch (error) {
        console.error("Error al agregar producto sin imagen:", error);
        toast.error("Ocurrió un error al agregar el producto");
        return;
      }
    }

    cargarProductos();
    handleCloseModal();
  };

  const actualizarProducto = async () => {
    if (!validarCamposProducto()) return;
    
    if (isCompressing) {
      toast.info("Por favor espere mientras la imagen se procesa...");
      return;
    }

    const formData = new FormData();
    formData.append("idProducto", productoEdit.idProducto);
    formData.append("nombreProducto", nombreProducto.trim());
    formData.append("montoPrecioProducto", montoPrecioProducto);
    formData.append("descripcionProducto", descripcionProducto.trim());
    formData.append("cantidadProducto", cantidadProducto);
    formData.append("tipoPesoProducto", unidadMedida);
    formData.append("codigoProducto", codigoProducto.trim());
    formData.append("stockProducto", stockProducto);
    formData.append("idCategoria", idCategoria);
    formData.append("estadoProducto", estadoProducto ? 1 : 0);

    if (imageFile) {
      formData.append("file", imageFile);
      console.log(`Actualizando producto con imagen optimizada: ${imageFile.name} (${(imageFile.size / (1024 * 1024)).toFixed(2)} MB)`);
    } else {
      console.log("Actualizando producto sin cambiar la imagen");
    }

    try {
      const response = await axios.put("http://localhost:8080/producto/actualizar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Respuesta de actualización:", response.data);
      toast.success("Producto actualizado con éxito");
      
      clearImage();
      
      cargarProductos();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Estado HTTP:", error.response.status);
        
        if (error.response.status === 413) {
          toast.error(`Error: La imagen es demasiado grande. El servidor acepta un máximo de 10MB.`);
        } else {
          const mensaje = error.response.data.message || "Ocurrió un error al actualizar el producto";
          toast.error(`Error: ${mensaje} (${error.response.status})`);
        }
      } else {
        toast.error("Ocurrió un error al actualizar el producto");
      }
    }
  };

  const eliminarProducto = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/producto/eliminar/${id}`);
      toast.success("Producto eliminado con éxito");
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Ocurrió un error al eliminar el producto");
    }
  };

  const activarDesactivarProductos = async (id) => {
    try {
      await axios.put(`http://localhost:8080/producto/activar/${id}`);
      toast.success("Cambio realizado con éxito.");
      cargarProductos();
    } catch (error) {
      console.error("Error al realizar el cambio:", error);
      toast.error("Ocurrió un error al cambiar el estado del producto.");
    }
  };

  const showAlertaInactivo = () => {
    Swal.fire({
      title: "Producto inactivo",
      text: "No puedes editar un producto inactivo.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
  }

  const handleShowModal = (producto = null) => {
    clearImage();
    
    if (producto) {
      setProductoEdit(producto);
      setNombreProducto(producto.nombreProducto);
      setMontoPrecioProducto(producto.montoPrecioProducto);
      setDescripcionProducto(producto.descripcionProducto);
      setCantidadProducto(producto.cantidadProducto);
      setUnidadMedida(producto.tipoPesoProducto);
      setCodigoProducto(producto.codigoProducto);
      setStockProducto(producto.stockProducto);
      setIdCategoria(producto.categoria?.idCategoria || "");
      setEstadoProducto(producto.estadoProducto);

      if (producto.imgProducto) {
        const previewURL = `http://localhost:8080/producto/images/${producto.imgProducto}`;
        setExistingImagePreview(previewURL);
      } else {
        setExistingImagePreview(null);
      }
    } else {
      setProductoEdit(null);
      setNombreProducto("");
      setMontoPrecioProducto("");
      setDescripcionProducto("");
      setCantidadProducto(1);
      setUnidadMedida("Ud");
      setCodigoProducto("");
      setStockProducto(0);
      setIdCategoria("");
      setEstadoProducto(1);
      setExistingImagePreview(null);
    }
    setShowModal(true);
  };

  const [existingImagePreview, setExistingImagePreview] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setProductoEdit(null);
    setNombreProducto("");
    setMontoPrecioProducto("");
    setDescripcionProducto("");
    setCantidadProducto(1);
    setUnidadMedida("Ud");
    setCodigoProducto("");
    setStockProducto(0);
    setIdCategoria("");
    setEstadoProducto(1);
    setExistingImagePreview(null);
    clearImage(); 
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredProductos = productos.filter((producto) =>
    producto.nombreProducto.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="producto-container">
      <SideBar usuario={usuario} />
      <div className="producto-main-container">
        <h1>Gestión de productos</h1>
        <Button className="producto-add-button" onClick={() => handleShowModal()}>
          <FontAwesomeIcon icon={faUpload} className="me-2" />
          Agregar producto nuevo
        </Button>
        <div className="producto-search-container">
          <label>Buscar producto</label>
          <input
            type="text"
            className="producto-search-input"
            placeholder="Buscar producto por nombre"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <Modal show={showModal} onHide={handleCloseModal} className="producto-modal" size="lg" centered>
          <Modal.Header
            closeButton
            className="producto-modal-header"
            style={{
              backgroundColor: '#9fc45a',
              color: '#000',
              borderBottom: 'none'
            }}
          >
            <Modal.Title>
              {productoEdit ? "Actualizar Producto" : "Agregar Producto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="producto-modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                productoEdit ? actualizarProducto() : agregarProducto();
              }}
            >
              <div className="producto-form-row">
                <div className="producto-form-column">
                  <div className="producto-form-group">
                    <label htmlFor="nombreProducto">Nombre del producto</label>
                    <input
                      id="nombreProducto"
                      className="producto-form-control"
                      type="text"
                      placeholder="Nombre del producto"
                      required
                      value={nombreProducto}
                      onChange={(e) => setNombreProducto(e.target.value)}
                    />
                  </div>

                  <div className="producto-form-group">
                    <label htmlFor="precioProducto">Precio</label>
                    <div className="producto-input-group">
                      <span className="producto-input-group-text">₡</span>
                      <input
                        id="precioProducto"
                        className="producto-form-control"
                        type="number"
                        placeholder="Precio del producto"
                        required
                        value={montoPrecioProducto}
                        onChange={(e) => setMontoPrecioProducto(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="producto-form-group">
                    <label htmlFor="codigoProducto">Código del producto</label>
                    <input
                      id="codigoProducto"
                      className="producto-form-control"
                      type="text"
                      placeholder="Código del producto"
                      required
                      value={codigoProducto}
                      onChange={(e) => setCodigoProducto(e.target.value)}
                    />
                  </div>

                  <div className="producto-form-group">
                    <label htmlFor="categoriaProducto">Categoría</label>
                    <select
                      id="categoriaProducto"
                      className="producto-form-control"
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
                </div>

                <div className="producto-form-column">
                  <div className="producto-form-group">
                    <label htmlFor="imgProducto">
                      Imagen del producto 
                      <small className="ms-2 text-muted">(Máx. {maxSizeMB}MB)</small>
                    </label>
                    
                    <div className="file-input-container">
                      <input
                        id="imgProducto"
                        className="producto-form-control"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <span className="file-status">
                        {isCompressing ? (
                          <span className="text-warning">Comprimiendo imagen...</span>
                        ) : (
                          imageFile ? 
                            <span className="text-success">
                              {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </span> 
                            : "Ningún archivo seleccionado"
                        )}
                      </span>
                      
                      {originalFileInfo && (
                        <div className="original-file-info">
                          <small className="text-muted">
                            Original: {originalFileInfo.name} ({originalFileInfo.sizeInMB} MB)
                          </small>
                        </div>
                      )}
                      
                      <div className="formatos-soportados">
                        <small>Formatos soportados: JPG, PNG, GIF, WebP, BMP, SVG</small>
                      </div>
                    </div>
                    
                    {isCompressing && (
                      <div className="compressing-indicator mt-2">
                        <Spinner animation="border" variant="secondary" size="sm" className="me-2" />
                        <small>Optimizando imagen para carga...</small>
                      </div>
                    )}
                    
                    {imagePreview && (
                      <div className="producto-img-preview-container">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="producto-img-preview"
                        />
                        <button 
                          type="button" 
                          className="clear-image-btn"
                          onClick={clearImage}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                    
                    {!imagePreview && existingImagePreview && (
                      <div className="producto-img-preview-container">
                        <img
                          src={existingImagePreview}
                          alt="Imagen actual"
                          className="producto-img-preview"
                        />
                        <div className="existing-image-label">Imagen actual</div>
                      </div>
                    )}
                  </div>

                  <div className="producto-form-group">
                    <label htmlFor="descripcionProducto">Descripción</label>
                    <textarea
                      id="descripcionProducto"
                      className="producto-form-control"
                      placeholder="Descripción del producto"
                      required
                      rows="3"
                      value={descripcionProducto}
                      onChange={(e) => setDescripcionProducto(e.target.value)}
                    />
                  </div>

                  <div className="producto-form-row">
                    <div className="producto-form-col">
                      <label htmlFor="cantidadProducto">Cantidad</label>
                      <input
                        id="cantidadProducto"
                        type="number"
                        className="producto-form-control"
                        min="1"
                        value={cantidadProducto}
                        onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="producto-form-col">
                      <label htmlFor="unidadMedida">Unidad de medida</label>
                      <select
                        id="unidadMedida"
                        className="producto-form-control"
                        value={unidadMedida}
                        onChange={(e) => setUnidadMedida(e.target.value)}
                        required
                      >
                        {unidadesMedida.map((unidad) => (
                          <option key={unidad} value={unidad}>
                            {unidad}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="producto-form-group">
                    <label htmlFor="stockProducto">Stock disponible</label>
                    <input
                      id="stockProducto"
                      type="number"
                      className="producto-form-control"
                      min="0"
                      value={stockProducto}
                      onChange={(e) => setStockProducto(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="producto-form-actions">
                <Button variant="outline-secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button 
                  className="producto-submit-button" 
                  type="submit"
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Procesando imagen...
                    </>
                  ) : (
                    productoEdit ? "Actualizar" : "Agregar"
                  )}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <ToastContainer />

        <div className="producto-table-container">
          <table className="producto-table">
            <thead>
              <tr className="producto-table-header-row">
                <th>No</th>
                <th>Información Producto</th>
                <th>Imagen</th>
                <th>Precio / Stock</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentProductos.length === 0 ? (
                <tr className="producto-no-results">
                  <td colSpan="7">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="producto-warning-icon" size="lg" />
                    <span>No hay productos disponibles</span>
                  </td>
                </tr>
              ) : (
                currentProductos.map((producto, index) => (
                  <tr key={producto.idProducto} className="producto-table-row">
                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="producto-info-cell">
                      <div className="producto-name">{producto.nombreProducto}</div>
                      <div className="producto-code">{producto.codigoProducto}</div>
                      <div className="producto-quantity">
                        {producto.cantidadProducto} {producto.tipoPesoProducto}
                      </div>
                    </td>
                    <td className="producto-image-cell">
                      {producto.imgProducto ? (
                        <div className="producto-image-wrapper">
                          <img
                            src={`http://localhost:8080/producto/images/${producto.imgProducto}`}
                            alt={producto.nombreProducto}
                            className="producto-image"
                            onError={(e) => {
                              console.error(`Error al cargar imagen: ${producto.imgProducto}`);
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 40 L70 40 L70 70 L30 70 Z' fill='%23cccccc'/%3E%3Cpath d='M40 30 L60 30 L60 40 L40 40 Z' fill='%23cccccc'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="producto-no-image">
                          <FontAwesomeIcon icon={faImage} className="me-2" />
                          No disponible
                        </div>
                      )}
                    </td>
                    <td className="producto-price-cell">
                      <div className="producto-price">₡{parseFloat(producto.montoPrecioProducto).toLocaleString()}</div>
                      <div className={`producto-stock ${parseInt(producto.stockProducto) < 10 ? "producto-low-stock" : "producto-in-stock"}`}>
                        Stock: {producto.stockProducto}
                      </div>
                    </td>
                    <td className="producto-description-cell">
                      {producto.descripcionProducto}
                    </td>
                    <td className="producto-category-cell">
                      {producto.nombreCategoria || "Sin categoría"}
                    </td>
                    <td className="producto-actions-cell">
                      <div className="producto-actions-container">
                        <button
                          className={`producto-status-button ${producto.estadoProducto ? "producto-status-active" : "producto-status-inactive"}`}
                          onClick={() => activarDesactivarProductos(producto.idProducto)}
                        >
                          {producto.estadoProducto ? "Activo" : "Inactivo"}
                        </button>
                        <div className="producto-action-buttons">
                          <button
                            className="producto-edit-button"
                            type="button"
                            onClick={() => {
                              if (!producto.estadoProducto) {
                                showAlertaInactivo();
                              } else {
                                handleShowModal(producto);
                              }
                            }}
                            title="Editar producto"
                          >
                            <FontAwesomeIcon icon={faEdit} />
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

export default ProductoApp;