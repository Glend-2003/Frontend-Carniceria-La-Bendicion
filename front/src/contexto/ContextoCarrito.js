import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("carrito");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCartMenu, setShowCartMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, cantidad) => {
    const existingProductIndex = cart.findIndex((item) => item.idProducto === product.idProducto);
  
    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      const totalCantidad = updatedCart[existingProductIndex].cantidad + cantidad;
  
      if (totalCantidad > product.stockProducto) {
        setErrorMessage(
          `No hay suficiente stock disponible. Solo puedes agregar ${
            product.stockProducto - updatedCart[existingProductIndex].cantidad
          } unidades más.`
        );
        return;
      } else {
        updatedCart[existingProductIndex].cantidad += cantidad;
        setCart(updatedCart);
        setErrorMessage("");
      }
    } else {
      if (cantidad > product.stockProducto) {
        setErrorMessage(
          `No hay suficiente stock disponible. Solo puedes agregar ${product.stockProducto} unidades.`
        );
        return;
      } else {
        setCart([...cart, { ...product, cantidad }]);
        setErrorMessage("");
      }
    }
  
    setShowCartMenu(true);
  };

  const increaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item.idProducto === productId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };
  
  const decreaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item.idProducto === productId && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.idProducto !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("carrito"); 
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity, 
        decreaseQuantity,
        removeFromCart,
        showCartMenu, 
        setShowCartMenu, 
        errorMessage, 
        setErrorMessage, 
        clearCart, 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);