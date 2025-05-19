import React, { useEffect } from 'react';
import ListaProductosApp from '../components/Catalogo/ListaProductosApp';
import FooterApp from '../components/Footer/FooterApp';
import NavbarApp from '../components/Navbar/NavbarApp';

const ResPagina = () => {
  useEffect(() => {
    console.log("Página de cortes de res cargada");
  }, []);

  return (
    <div>
      <NavbarApp />
      <ListaProductosApp categoria="Res" />
      <FooterApp />
    </div>
  );
};

export default ResPagina;