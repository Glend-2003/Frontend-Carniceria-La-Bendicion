import React from 'react';
import { Offcanvas, ListGroup, Button, Badge } from 'react-bootstrap';

function CarritoApp({showCart, handleShowCart, cart, removeFromCart }) {
  return (
    <Offcanvas show={showCart} onHide={handleShowCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Carrito de Compras</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <h5>Tu Carrito</h5>
        {cart.length > 0 ? (
          <ListGroup>
            {cart.map((item, index) => (
              <ListGroup.Item key={index}>
                {item.imgProducto ? (
                  <img
                    src={`http://localhost:8080/producto/images/${item.imgProducto}`}
                    alt={item.imgProducto}
                    width="50"
                  />
                ) : (
                  'No disponible'
                )}
                {item.nombreProducto} - ₡{item.montoPrecioProducto} {' 1 Kg '}
                <Button
                  variant="danger"
                  size="sm"
                  className="float-end"
                  onClick={() => removeFromCart(index)}
                >
                  Quitar
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No hay productos en el carrito.</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CarritoApp;
