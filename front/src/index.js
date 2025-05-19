import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./components/Navbar/AppContext"; 
import { CartProvider } from './contexto/ContextoCarrito';
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/styles.min.css";
import LoginApp from "./components/Login/LoginApp";
import Historia from './components/Home/Historia';
import Registrar from './components/Usuarios/Registrar';
import ResetPassword from "./components/Login/ResetPasswod";
import AuthOffcanvas from './components/Auth/AuthOffcanvas';
import CarritoApp from './components/Carrito/CarritoApp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Principal from "./components/Principal/principal";
import Categoria from './components/Categoria/CategoriaApp';
import Usuarios from './components/Usuarios/GestionarUsuario';
import ProductoApp from './components/Productos/ProductoApp';
import ComentarioApp from './components/Comentario/ComentarioApp';
import PromocionApp from './components/Promocion/PromocionApp';
import TipoPagoApp from './components/TipoPago/TipoPagoApp';
import PedidosApp from './components/Pedido/PedidosApp';
import VentaPedido from './components/ControlVentaPedido/VentaPedido';
import PerfilUsuario from './components/DetallesCliente/PerfilUsuario';
import Dashboard from './components/DetallesCliente/Dashboard';
import Orders from './components/DetallesCliente/Orders';
import DireccionUsuario from './components/DetallesCliente/DireccionUsuario';
import ResPagina from './paginas/ResPagina';
import CerdoPagina from './paginas/CerdoPagina';
import PolloPagina from './paginas/PolloPagina';
import ProductosVariosPagina from './paginas/ProductosVariosPagina';
import ProductosDestacadosPagina from './paginas/ProductosDestacadosPagina';
import PrivateRoute from './components/PrivateRoute'; 

const AppLayout = ({ children }) => {
  return (
    <>
      {children}
      <AuthOffcanvas />
      <CarritoApp />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <CartProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LoginApp />} />
              <Route path="/historia" element={<Historia />} />
              <Route path="/register" element={<Registrar />} />
              <Route path="/ResetPassword" element={<ResetPassword />} />
              <Route path="/cortes-de-res" element={<ResPagina />} />
              <Route path="/cortes-de-cerdo" element={<CerdoPagina />} />
              <Route path="/cortes-de-pollo" element={<PolloPagina />} />
              <Route path="/productos-varios" element={<ProductosVariosPagina />} />
              <Route path="/productos-destacados" element={<ProductosDestacadosPagina />} />
              <Route path="/pedido" element={<LoginApp initialPage="pedido" />} />
              <Route path="/verOrden" element={<LoginApp initialPage="verOrden" />} />
              <Route
                path="/principal"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <Principal />
                  </PrivateRoute>
                }
              />
              <Route
                path="/CategoriaApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <Categoria />
                  </PrivateRoute>
                }
              />
              <Route
                path="/GestionarUsuario"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <Usuarios />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ComentarioApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <ComentarioApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ProductoApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <ProductoApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PromocionApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <PromocionApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/TipoPagoApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <TipoPagoApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PedidosApp"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <PedidosApp />
                  </PrivateRoute>
                }
              />
              <Route
                path="/VentaPedido"
                element={
                  <PrivateRoute allowedRoles={['Administrador', 'Gerente']}>
                    <VentaPedido />
                  </PrivateRoute>
                }
              />
              <Route
                path="/PerfilUsuario"
                element={
                  <PrivateRoute> 
                    <PerfilUsuario />
                  </PrivateRoute>
                }
              />
              <Route
                path="/Dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/DireccionUsuario"
                element={
                  <PrivateRoute> 
                    <DireccionUsuario />
                  </PrivateRoute>
                }
              />
              <Route
                path="/Orders"
                element={
                  <PrivateRoute> 
                    <Orders />
                  </PrivateRoute>
                }
              />
            </Routes>
          </AppLayout>
        </Router>
      </CartProvider>
    </AppProvider>
  </React.StrictMode>
);