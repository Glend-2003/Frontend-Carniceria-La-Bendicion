import React from 'react';
import ListaProductosApp from '../components/Catalogo/ListaProductosApp';
import FooterApp from '../components/Footer/FooterApp';
import NavbarApp from '../components/Navbar/NavbarApp';

const ProductosDestacadosPagina = () => {
  return (
    <div>
      <NavbarApp />
      <ListaProductosApp categoria="Destacados" />
      <FooterApp />
    </div>
  );
};

export default ProductosDestacadosPagina;