import React from 'react';
import ListaProductosApp from '../components/Catalogo/ListaProductosApp';
import FooterApp from '../components/Footer/FooterApp';
import NavbarApp from '../components/Navbar/NavbarApp';

const ProductosVariosPagina = () => {
  return (
    <div>
      <NavbarApp />
      <ListaProductosApp categoria="Varios" />
      <FooterApp />
    </div>
  );
};

export default ProductosVariosPagina;