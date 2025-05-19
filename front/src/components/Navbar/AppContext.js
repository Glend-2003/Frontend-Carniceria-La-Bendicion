import { createContext, useState, useContext, useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios";

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [cart, setCart] = useState([])
  const [idUsuario, setIdUsuario] = useState(localStorage.getItem("idUsuario"));
  const [productos, setProductos] = useState([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); 
  const [allProducts, setAllProducts] = useState([]); 

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/producto/', { 
          params: { estadoProducto: 1 } 
        });
        setAllProducts(response.data);
      } catch (error) {
        console.error('Error al cargar todos los productos:', error);
      }
    };
    
    fetchAllProducts();
  }, []);

  const buscarProductos = (termino) => {
    sessionStorage.setItem("searchTerm", termino);
    setGlobalSearchTerm(termino);
  };
  
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/producto/', { 
          params: { estadoProducto: 1 } 
        });
        setAllProducts(response.data);
      } catch (error) {
        console.error('Error al cargar todos los productos:', error);
      }
    };
    
    fetchAllProducts();
    
    const savedTerm = sessionStorage.getItem("searchTerm");
    if (savedTerm) {
      setGlobalSearchTerm(savedTerm);
    }
  }, []);

  const limpiarBusqueda = () => {
    localStorage.removeItem("globalSearchTerm");
    setGlobalSearchTerm("");
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("carrito") || "[]")
    setCart(savedCart)
  }, [])

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("carrito") || "[]")
    
    if (idUsuario) {
      const updatedCart = savedCart.map((item) => ({
        ...item,
        usuarioId: idUsuario,
      }))
      setCart(updatedCart)
      localStorage.setItem("carrito", JSON.stringify(updatedCart))
    } else {
      const updatedCart = savedCart.map(({ usuarioId, ...rest }) => rest)
      setCart(updatedCart)
      localStorage.setItem("carrito", JSON.stringify(updatedCart))
    }
  }, [idUsuario])

  const handleShowSidebar = () => {
    setShowSidebar(!showSidebar && !idUsuario)
  }

  const handleShowCart = () => {
    setShowCart(!showCart)
  }

  const addToCart = (producto) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.idProducto === producto.idProducto)

      let newCart
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.idProducto === producto.idProducto ? { ...item, cantidad: item.cantidad + producto.cantidad } : item,
        )
      } else {
        newCart = [...prevCart, { ...producto, usuarioId: idUsuario || null }]
      }

      localStorage.setItem("carrito", JSON.stringify(newCart))
      return newCart
    })
  }
  
  const removeFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, idx) => idx !== indexToRemove)
    setCart(updatedCart)
    localStorage.setItem("carrito", JSON.stringify(updatedCart))
    toast.info("Producto eliminado del carrito")
  }

  const clearCart = () => {
    setCart([])
    localStorage.setItem("carrito", JSON.stringify([]))
  }

  const updateUserStatus = () => {
    const id = localStorage.getItem("idUsuario");
    setIdUsuario(id);
   
    return id;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("nombreRol");
    localStorage.removeItem("idUsuario");
    updateUserStatus(); 
    window.location.href = "/"; 
  };

  const contextValue = {
    showSidebar,
    showCart,
    cart,
    idUsuario,
    handleShowSidebar,
    handleShowCart,
    addToCart,
    removeFromCart,
    clearCart,
    globalSearchTerm,
    buscarProductos,
    limpiarBusqueda,
    setGlobalSearchTerm,
    allProducts, 
    updateUserStatus,
    handleLogout
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext debe ser usado dentro de un AppProvider")
  }
  return context
}