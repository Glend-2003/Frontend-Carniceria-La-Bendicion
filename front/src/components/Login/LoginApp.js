import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Offcanvas } from "react-bootstrap";
import ListaProductosApp from "../Catalogo/ListaProductosApp.js";
import PedidoCrud from "../Pedido/PedidoCrud.js";
import Historia from "../Home/Historia.js";
import MostrarOrdenApp from "../Orden/MostrarOdenApp.js";
import ResPagina from "../../paginas/ResPagina.js";
import CerdoPagina from "../../paginas/CerdoPagina.js";
import PolloPagina from "../../paginas/PolloPagina.js";
import ProductosVariosPagina from "../../paginas/ProductosVariosPagina.js";
import ProductosDestacadosPagina from "../../paginas/ProductosDestacadosPagina.js";
import NavbarApp from "../Navbar/NavbarApp.js";
import FooterApp from "../Footer/FooterApp.js";
import { useAppContext } from "../Navbar/AppContext";


function LoginApp({ initialPage = "home" }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const location = useLocation();
  const { addToCart } = useAppContext(); 

  useEffect(() => {
    const pathToPage = {
      "/pedido": "pedido",
      "/historia": "historia", 
      "/verOrden": "verOrden",
      "/cortes-de-res": "res",
      "/cortes-de-cerdo": "cerdo",
      "/cortes-de-pollo": "pollo",
      "/productos-varios": "varios",
      "/productos-destacados": "destacados",
      "/": "home",
    };
    const page = pathToPage[location.pathname] || initialPage;
    setCurrentPage(page);
  }, [location.pathname, initialPage]);

  const renderMainContent = () => {
    switch (currentPage) {
      case "pedido":
        return <PedidoCrud />;
      case "verOrden":
        return <MostrarOrdenApp />;
      case "home":
      default:
        return <ListaProductosApp categoria={null} />; 
    }
  };

  return (
    <div className="page-container">
      <NavbarApp />

      <main className="flex-grow-1" style={{ marginTop: "0px" }}> 
        {renderMainContent()}
      </main>
      <FooterApp />
    </div>
  );
}

export default LoginApp;