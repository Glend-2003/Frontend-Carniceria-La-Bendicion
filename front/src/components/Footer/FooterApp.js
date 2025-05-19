import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Footer.css";
import { FaFacebook, FaWhatsapp, FaPhone } from 'react-icons/fa';

const FooterApp = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="page-footer py-3">
            <div className="container footer-container py-1">
                <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                    Desarrollado por: <a href="https://halobcompany.com" target="_blank" rel="noopener noreferrer">Halob Company</a>
                </p>

                <div className="social-icons">
                    <a href="https://www.facebook.com/jamel.sandi.3" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <FaFacebook />
                    </a>
                    <a href="https://wa.me/50688955772" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <FaWhatsapp />
                    </a>
                    <a href="tel:+50688955772" aria-label="Teléfono">
                        <FaPhone />
                    </a>
                </div>

                <div className="contact-info d-flex align-items-center">
                    <span className="text-light">+506 8895-5772</span>
                </div>
            </div>

            <div className="copyright py-1">
                <p className="text-center mb-0">&copy; {currentYear} Carnicería La Bendición. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default FooterApp;