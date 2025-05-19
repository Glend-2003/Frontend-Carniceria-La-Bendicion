import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Modal, Form, Row, Col, Badge, Container } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useCart } from '../../contexto/ContextoCarrito';
import { FiFilter, FiX, FiShoppingCart, FiInfo, FiStar, FiChevronDown } from "react-icons/fi";
import "./ListaProductos.css";
import { useAppContext } from "../Navbar/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

function ListaProductosApp({ categoria }) {
  const { addToCart } = useCart();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sortOrder, setSortOrder] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const { globalSearchTerm } = useAppContext();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isGlobalFilter, setIsGlobalFilter] = useState(false);

  const colors = {
    darkGreen: '#103f1b',
    mediumGreen: '#387623',
    lightGreen: '#9fc45a',
    darkBrown: '#875725',
    lightBrown: '#958933'
  };

  const verDetalles = (producto) => {
    setSelectedProduct(producto);
    setCantidad(1);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      const cantidadValida = Math.max(1, Math.min(cantidad, selectedProduct.stockProducto || 10));
      const productoConCantidad = {
        ...selectedProduct,
        cantidad: cantidadValida,
      };
      addToCart(productoConCantidad, cantidadValida);
      handleCloseModal();
    }
  };

  // Obtener todos los productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/producto/', { 
          params: { estadoProducto: 1 } 
        });
        setProductos(response.data);
        
        if (response.data.length > 0) {
          const prices = response.data.map(p => p.montoPrecioProducto);
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices)
          });
          setSelectedPrice(Math.max(...prices));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Obtener categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:8080/categoria/', {
          params: { estadoCategoria: 1 }
        });
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  // Efecto para manejar cuando se activa el filtro global
  useEffect(() => {
    if (globalSearchTerm || selectedCategories.length > 0 || selectedPrice < priceRange.max || sortOrder !== "default") {
      setIsGlobalFilter(true);
    } else {
      setIsGlobalFilter(false);
    }
  }, [globalSearchTerm, selectedCategories, selectedPrice, sortOrder, priceRange.max]);

  // Aplicar filtros
  useEffect(() => {
    if (productos.length === 0 || categorias.length === 0) return;

    let resultados = [...productos];

    // Solo aplicar filtro de categoría si no estamos en modo filtro global
    if (categoria && !isGlobalFilter) {
      if (categoria.toLowerCase() === "varios") {
        const categoriasExcluidas = categorias
          .filter(cat => ["res", "cerdo", "pollo"].includes(cat.nombreCategoria.toLowerCase()))
          .map(cat => cat.idCategoria);

        resultados = resultados.filter(
          producto => producto.categoria && 
          !categoriasExcluidas.includes(producto.categoria.idCategoria)
        );
      } else {
        const categoriaObj = categorias.find(
          cat => cat.nombreCategoria.toLowerCase() === categoria.toLowerCase()
        );

        if (categoriaObj) {
          resultados = resultados.filter(
            producto => producto.categoria && 
            producto.categoria.idCategoria === categoriaObj.idCategoria
          );
        } else {
          resultados = [];
        }
      }
    }

    // Aplicar filtros globales
    if (globalSearchTerm) {
      resultados = resultados.filter(producto =>
        producto.nombreProducto.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (producto.descripcionProducto?.toLowerCase().includes(globalSearchTerm.toLowerCase())) ||
        (producto.codigoProducto?.toLowerCase().includes(globalSearchTerm.toLowerCase()))
      );
    }

    if (selectedCategories.length > 0) {
      resultados = resultados.filter(producto =>
        producto.categoria && selectedCategories.includes(producto.categoria.idCategoria)
      );
    }

    resultados = resultados.filter(product => 
      product.montoPrecioProducto <= selectedPrice
    );

    if (sortOrder === "price-asc") {
      resultados.sort((a, b) => a.montoPrecioProducto - b.montoPrecioProducto);
    } else if (sortOrder === "price-desc") {
      resultados.sort((a, b) => b.montoPrecioProducto - a.montoPrecioProducto);
    }

    setFilteredProducts(resultados);
  }, [productos, categorias, categoria, globalSearchTerm, selectedCategories, selectedPrice, sortOrder, isGlobalFilter]);

  const handlePriceFilter = () => {
    const filtered = productos.filter(product => 
      product.montoPrecioProducto <= selectedPrice
    );
    setFilteredProducts(filtered);
  };

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
  };

  const toggleCategoryFilter = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const applyCategoryFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedPrice(priceRange.max);
    setSortOrder("default");
    navigate(location.pathname); // Esto recarga la vista sin filtros
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="catalogo-hero">
        <div className="catalogo-hero-content">
          <h1>NUESTROS PRODUCTOS</h1>
          <p className="hero-subtitle">Carne fresca de la más alta calidad, seleccionada cuidadosamente para tu familia</p>
          <div className="hero-badges">
            <span className="badge"><FiStar /> Calidad garantizada</span>
            <span className="badge"><FiStar /> Cortes premium</span>
            <span className="badge"><FiStar /> Entrega rápida</span>
          </div>
        </div>
      </div>

      <Container fluid className="product-catalog-container px-md-5">
        <ToastContainer position="top-right" autoClose={3000} />

        <Row>
          <Col md={3} className="sidebar-filters mb-4">
            <div className="filter-card p-3 mb-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">
                  <FiFilter className="me-2" />
                  Filtros
                </h5>
                <button className="btn btn-sm btn-link text-decoration-none" onClick={resetFilters} style={{ color: colors.mediumGreen }}>
                  Limpiar
                </button>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3">Precio</h6>
                <p className="small text-muted mb-2">Selecciona el rango de precios que deseas explorar</p>
                <div className="d-flex justify-content-between mb-2">
                  <span>₡{priceRange.min.toLocaleString()}</span>
                  <span>₡{selectedPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(Number(e.target.value))}
                  className="form-range"
                  style={{ accentColor: colors.mediumGreen }}
                />
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3">Categorías</h6>
                <div className="category-list">
                  {categorias.map(cat => (
                    <div key={cat.idCategoria} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedCategories.includes(cat.idCategoria)}
                        onChange={() => toggleCategoryFilter(cat.idCategoria)}
                        style={{ accentColor: colors.mediumGreen }}
                      />
                      <label className="form-check-label">
                        {cat.nombreCategoria}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="results-count">
              Mostrando <strong>{filteredProducts.length}</strong> productos
            </div>
            <div className="sort-dropdown">
              <select 
                value={sortOrder} 
                onChange={handleSortChange} 
                className="form-select"
                style={{
                  borderColor: colors.mediumGreen,
                  borderRadius: '20px',
                  padding: '8px 15px',
                  width: 'auto',
                  display: 'inline-block'
                }}
              >
                <option value="default">Ordenar por</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: colors.mediumGreen }} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <h5>No hay productos disponibles</h5>
              <p>Intenta ajustar tus filtros de búsqueda</p>
              <button 
                onClick={resetFilters} 
                className="btn"
                style={{ 
                  backgroundColor: colors.mediumGreen, 
                  color: 'white',
                  borderRadius: '5px'
                }}
              >
                Mostrar todos los productos
              </button>
            </div>
          ) : (
         <div className="product-grid">
  {filteredProducts.map((product) => (
  <div className="product-card-wrapper" key={product.idProducto}>
    <div className="product-card">
   
      <div className="product-availability">
        <span className={`availability-badge ${product.stockProducto > 0 ? 'available' : 'sold-out'}`}>
          {product.stockProducto > 0 ? 'DISPONIBLE' : 'AGOTADO'}
        </span>
      </div>
      
      <div className="category-tag">
        {product.categoria?.nombreCategoria || 'CARNES'}
      </div>
      
      <div className="product-image-container">
    <img
        src={`http://localhost:8080/producto/images/${product.imgProducto}`}
        alt={product.nombreProducto || "Imagen del producto no disponible"}
        style={{ width: "100%", height: "auto" }}
        className="product-image"
        onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.jpg";
        }}
        
    />
       <div 
        className="cart-icon-floating"
        onClick={() => {
          if (product.stockProducto > 0) {
            const productoConCantidad = {
              ...product,
              cantidad: 1,
            };
            addToCart(productoConCantidad, 1);
          }
        }}
        style={{ display: product.stockProducto <= 0 ? 'none' : 'flex' }}
      >
        <FiShoppingCart className="icon" />
      </div>
</div>
      
      <div className="product-content">
        <h3 className="product-title">{product.nombreProducto}</h3>
        
        <div className="product-weight">
          {product.cantidadProducto} {product.tipoPesoProducto}
        </div>
        
        <div className="product-sku">
          SKU: {product.codigoProducto || 'N/A'}
        </div>
        
        <div className="product-price">
          {new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
            minimumFractionDigits: 0,
          }).format(product.montoPrecioProducto)}
        </div>
      </div>
      
      <div className="product-actions">
        <button 
          className="details-btn"
          onClick={() => verDetalles(product)}
        >
          <FiInfo className="icon" /> Ver detalles
        </button>
        
        <button 
          className={`add-to-cart-btn ${product.stockProducto <= 0 ? 'disabled' : ''}`}
          onClick={() => {
            if (product.stockProducto > 0) {
              const productoConCantidad = {
                ...product,
                cantidad: 1,
              };
              addToCart(productoConCantidad, 1);
            }
          }}
          disabled={product.stockProducto <= 0}
        >
          <FiShoppingCart className="icon" /> Agregar
        </button>
      </div>
    </div>
  </div>
))}
</div>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
  <Modal.Header closeButton style={{ 
    borderBottom: `2px solid ${colors.lightGreen}`,
    padding: '20px 25px',
  }}>
    <Modal.Title className="fw-bold" style={{ color: colors.darkGreen }}>
      {selectedProduct?.nombreProducto}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ padding: '25px' }}>
    {selectedProduct && (
      <div className="row">
        <div className="col-md-6">
          <div className="product-modal-image-container" style={{
            height: '350px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            backgroundColor: '#f8f9fa',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              backgroundColor: colors.darkBrown,
              color: 'white',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {selectedProduct.categoria?.nombreCategoria || 'Res'}
            </div>
            
            <img
              src={`http://localhost:8080/producto/images/${selectedProduct.imgProducto}`}
              alt={selectedProduct.nombreProducto}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          

          <div className="price-section mb-3" style={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <span className="product-price-modal" style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: colors.darkGreen
            }}>
              {new Intl.NumberFormat("es-CR", {
                style: "currency",
                currency: "CRC",
                minimumFractionDigits: 0,
              }).format(selectedProduct.montoPrecioProducto)}
            </span>
            {selectedProduct.precioAnterior && (
              <span className="product-old-price-modal ms-3" style={{
                fontSize: '1.2rem',
                color: '#999',
                textDecoration: 'line-through'
              }}>
                {new Intl.NumberFormat("es-CR", {
                  style: "currency",
                  currency: "CRC",
                  minimumFractionDigits: 0,
                }).format(selectedProduct.precioAnterior)}
              </span>
            )}
          </div>

          <div className="availability-info mb-3" style={{
            display: 'inline-block',
            padding: '6px 15px',
            borderRadius: '20px',
            backgroundColor: selectedProduct.stockProducto > 0 ? '#e8f5e9' : '#ffebee',
            color: selectedProduct.stockProducto > 0 ? colors.mediumGreen : '#d32f2f'
          }}>
            <span style={{ fontWeight: '600' }}>
              {selectedProduct.stockProducto > 0 ? 
                `En stock: ${selectedProduct.stockProducto} unidades` : 
                'Agotado'}
            </span>
          </div>

          <p className="product-description" style={{
            color: '#555',
            lineHeight: '1.7',
            margin: '20px 0',
            fontSize: '1rem',
            borderLeft: `4px solid ${colors.lightGreen}`,
            paddingLeft: '15px',
            backgroundColor: '#f9f9f9',
            padding: '15px'
          }}>
            {selectedProduct.descripcionProducto || "Corte de res premium, ideal para asar. Nuestros productos son seleccionados cuidadosamente para garantizar la mejor calidad y sabor."}
          </p>

          <div className="product-meta mb-4" style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div className="meta-item" style={{ marginBottom: '10px', display: 'flex' }}>
              <div style={{ width: '120px', fontWeight: '600', color: '#555' }}>SKU:</div>
              <div>{selectedProduct.codigoProducto || 'N/A'}</div>
            </div>
            <div className="meta-item" style={{ marginBottom: '10px', display: 'flex' }}>
              <div style={{ width: '120px', fontWeight: '600', color: '#555' }}>Categoría:</div>
              <div>{selectedProduct.categoria?.nombreCategoria || 'N/A'}</div>
            </div>
            <div className="meta-item" style={{ marginBottom: '10px', display: 'flex' }}>
              <div style={{ width: '120px', fontWeight: '600', color: '#555' }}>Peso:</div>
              <div>{selectedProduct.cantidadProducto} {selectedProduct.tipoPesoProducto}</div>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Cantidad:</Form.Label>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                style={{ 
                  borderColor: colors.mediumGreen,
                  color: colors.mediumGreen,
                  borderRadius: '8px 0 0 8px',
                  padding: '10px 15px',
                  fontWeight: '600'
                }}
              >
                -
              </Button>
              <Form.Control
                type="number"
                min="1"
                max={selectedProduct.stockProducto || 10}
                value={cantidad}
                onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                className="text-center quantity-input"
                style={{ 
                  borderColor: colors.mediumGreen,
                  borderRadius: '0',
                  height: '45px',
                  fontWeight: '600',
                  fontSize: '1.1rem'
                }}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setCantidad(prev => Math.min(selectedProduct.stockProducto || 10, prev + 1))}
                style={{ 
                  borderColor: colors.mediumGreen,
                  color: colors.mediumGreen,
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 15px',
                  fontWeight: '600'
                }}
              >
                +
              </Button>
            </div>
          </Form.Group>

          <Button 
            variant="success" 
            className="w-100 add-to-cart-modal-btn"
            onClick={handleAddToCartFromModal}
            disabled={!selectedProduct.stockProducto || selectedProduct.stockProducto <= 0}
            style={{ 
              backgroundColor: selectedProduct.stockProducto > 0 ? colors.mediumGreen : '#cccccc',
              border: 'none',
              padding: '15px',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '8px',
              boxShadow: selectedProduct.stockProducto > 0 ? '0 4px 10px rgba(56, 118, 35, 0.3)' : 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <FiShoppingCart className="me-2" />
            {selectedProduct.stockProducto > 0 ? 'Agregar al carrito' : 'Producto agotado'}
          </Button>
        </div>
      </div>
    )}
  </Modal.Body>
</Modal>
    </Container>
    </>
  );
}

export default ListaProductosApp;