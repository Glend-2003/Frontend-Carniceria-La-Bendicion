import React, { useState, useEffect } from "react";
import { Navbar as BootstrapNavbar, Container, Nav, Badge } from "react-bootstrap";
import DropDown from "../DropDown/DropDown";
import { useAppContext } from "../Navbar/AppContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.min.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useCart } from '../../contexto/ContextoCarrito';
import { Form, InputGroup, FormControl, Button } from "react-bootstrap";
import { FaHome } from 'react-icons/fa';

const NavbarApp = () => {
  const { cart, showCartMenu, setShowCartMenu } = useCart();
  const {
    idUsuario,
    handleShowSidebar,
    handleLogout,
    buscarProductos,
    globalSearchTerm,
    setGlobalSearchTerm
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
  }, [idUsuario]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      buscarProductos(searchQuery.trim());
      if (location.pathname !== "/") {
        window.location.href = '/';
      }
      navigate('/', { replace: true });
    }
    setTimeout(() => setSearchQuery(""), 300);
    setSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    limpiarBusqueda();
    setSearchOpen(false);
    sessionStorage.removeItem("searchTerm");
  };

  const limpiarBusqueda = () => {
    setGlobalSearchTerm("");
    sessionStorage.removeItem("searchTerm");
  };

  const navbarClasses = `navbar-transition ${isScrolled ? "navbar-scrolled" : "navbar-top"}`;

  return (
    <BootstrapNavbar
      expand="lg"
      variant="dark"
      className={navbarClasses}
      sticky="top"
      style={{ position: 'relative', zIndex: 1100 }}
    >
      <Container fluid="lg">
        <div className="navbar-brand-container d-none d-lg-flex">
          <Link to="/Historia" className="d-flex align-items-center text-decoration-none">
            <img
              src={require('../../assets/images/LogoCarn.png')}
              alt="Carnicería La Bendición"
              className="navbar-logo"
            />
            <BootstrapNavbar.Brand className="brand-text">
              Carnicería La Bendición
            </BootstrapNavbar.Brand>
          </Link>
        </div>

        <div className="d-flex d-lg-none align-items-center">
          <Link to="/Historia" className="d-flex align-items-center text-decoration-none">
            <img
              src={require('../../assets/images/LogoCarn.png')}
              alt="Carnicería La Bendición"
              className="navbar-logo"
            />
            <BootstrapNavbar.Brand className="brand-text">
              Carnicería La Bendición
            </BootstrapNavbar.Brand>
          </Link>
        </div>

        <div className="d-flex align-items-center ml-auto d-lg-none">
          <Nav.Link className="icon-link" onClick={() => setSearchOpen(!searchOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              fill="currentColor"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </Nav.Link>
          <Nav.Link className="icon-link cart-icon mx-2" onClick={() => setShowCartMenu(!showCartMenu)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              fill="currentColor"
              className="bi bi-cart"
              viewBox="0 0 16 16"
            >
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            {cart.length > 0 && (
              <Badge className="cart-badge">
                {cart.length}
              </Badge>
            )}
          </Nav.Link>
        </div>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto main-nav" >
            <Nav.Link as={Link} to="/" className="nav-link-custom" onClick={handleClearSearch}>
              <FaHome size={28} />
            </Nav.Link>
            <Nav.Link as={Link} to="/cortes-de-res" className="nav-link-custom" onClick={handleClearSearch}>
              CORTES DE RES
            </Nav.Link>
            <Nav.Link as={Link} to="/cortes-de-cerdo" className="nav-link-custom" onClick={handleClearSearch}>
              CORTES DE CERDO
            </Nav.Link>
            <Nav.Link as={Link} to="/cortes-de-pollo" className="nav-link-custom" onClick={handleClearSearch}>
              CORTES DE POLLO
            </Nav.Link>
            <Nav.Link as={Link} to="/productos-varios" className="nav-link-custom" onClick={handleClearSearch}>
              PRODUCTOS VARIOS
            </Nav.Link>
            <Nav.Link as={Link} to="/productos-destacados" className="nav-link-custom" onClick={handleClearSearch}>
              PRODUCTOS DESTACADOS
            </Nav.Link>
          </Nav>

          <Nav className="icons-nav d-none d-lg-flex">
            <Nav.Link className="icon-link" onClick={() => setSearchOpen(!searchOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </Nav.Link>

            <div className="icon-link user-dropdown-container" style={{ position: 'relative', zIndex: searchOpen ? 1101 : 'auto' }}>
              <Nav.Link onClick={() => {
                handleShowSidebar();
                setSearchOpen(false);
              }}>
                <DropDown
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.5em"
                      height="1.5em"
                      fill="currentColor"
                      className="bi bi-person"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                  }
                  idUsuario={idUsuario}
                  onLogout={handleLogout}
                />
              </Nav.Link>
            </div>

            <Nav.Link className="icon-link cart-icon" onClick={() => setShowCartMenu(!showCartMenu)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                fill="currentColor"
                className="bi bi-cart"
                viewBox="0 0 16 16"
              >
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
              </svg>
              {cart.length > 0 && (
                <Badge className="cart-badge">
                  {cart.length}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>

      {searchOpen && (
        <div className="search-container">
          <Form className="search-form" onSubmit={handleSearch}>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                type="submit"
              >
                Buscar
              </Button>
              <button
                className="search-close-btn"
                onClick={handleClearSearch}
                type="button"
                aria-label="Cerrar búsqueda"
              >
                ×
              </button>
            </InputGroup>

          </Form>
        </div>
      )}
    </BootstrapNavbar>
  );
};

export default NavbarApp;