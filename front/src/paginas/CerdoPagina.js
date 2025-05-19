import React from 'react';
import ListaProductosApp from '../components/Catalogo/ListaProductosApp';
import FooterApp from '../components/Footer/FooterApp';
import NavbarApp from '../components/Navbar/NavbarApp';

const CerdoPagina = () => {
  return (
    <div>
      <NavbarApp />
      <ListaProductosApp categoria="Cerdo" />
      <FooterApp />
    </div>
  );
};

export default CerdoPagina;