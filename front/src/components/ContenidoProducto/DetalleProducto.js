import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom"; 
import axios from "axios"; 
import { Card, Button, Spinner, Row, Col, Container, Navbar } from "react-bootstrap";
import "../ContenidoProducto/DetalleProducto.css"; 

const DetalleProducto = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [quantity, setQuantity] = useState(1); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/producto/${id}`);
        setProduct(response.data); 
      } catch (err) {
        setError("Error al cargar el producto"); 
      } finally {
        setLoading(false); 
      }
    };

    fetchProduct();
  }, [id]); 

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  const increaseQuantity = () => {
    if (quantity < product.stockProducto) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = product.montoPrecioProducto * quantity;

  return (
    
    <Container className="product-detail-container">
      <Card className="product-detail-card">
        <Row className="g-0">
          <Col md={6}>
            <Card.Img
              variant="top"
              src={`http://localhost:8080${product.imgProducto}`} 
              className="product-detail-img"
            />

          </Col>

          <Col md={6}>
            <Card.Body>
              <Card.Title>{product.nombreProducto}</Card.Title>
              <Card.Text>
                <strong>Descripción:</strong> {product.descripcionProducto}
              </Card.Text>
              <Card.Text>
                <strong>Precio Unitario:</strong>{" "}
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(product.montoPrecioProducto)}
              </Card.Text>
              <Card.Text>
                <strong>Stock:</strong> {product.stockProducto}
              </Card.Text>

              <div className="quantity-container">
                <Button variant="secondary" onClick={decreaseQuantity}>
                  -
                </Button>
                <span className="quantity">{quantity}</span>
                <Button variant="secondary" onClick={increaseQuantity}>
                  +
                </Button>
              </div>

              <Card.Text>
                <strong>Precio Total:</strong>{" "}
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(totalPrice)}
              </Card.Text>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <Button
                variant="primary"
                onClick={() => {
                  addToCart(product, quantity); 
                  setShowCartMenu(true); 
                }}
              >
                Agregar al Carrito
              </Button>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default DetalleProducto;

