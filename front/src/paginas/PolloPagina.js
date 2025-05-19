import React from 'react';
import ListaProductosApp from '../components/Catalogo/ListaProductosApp';
import FooterApp from '../components/Footer/FooterApp';
import NavbarApp from '../components/Navbar/NavbarApp';

const PolloPagina = () => {
  return (
    <div>
      <NavbarApp />
      <ListaProductosApp categoria="Pollo" />
      <FooterApp />
    </div>
  );
};

export default PolloPagina;