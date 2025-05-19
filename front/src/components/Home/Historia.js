import React from "react";
import { Calendar, Award, Clock, Users, MapPin } from "lucide-react";
import './Historia.css';
import Resena from "../Comentario/Resena";
import NavbarApp from "../Navbar/NavbarApp.js";
import FooterApp from "../Footer/FooterApp";

const Historia = () => {
  return (
    <div className="historia-container">
      <NavbarApp />
      <div className="historia-hero">
        <div className="historia-hero-overlay">
          <h1 className="historia-title">Nuestra Historia</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="historia-intro">
          <h2 className="historia-intro-title">Tradición y Calidad desde 1982</h2>
          <p className="historia-intro-text">
            En Carnicería la Bendición, llevamos más de cuatro décadas sirviendo a nuestra comunidad con los mejores cortes de carne y productos cárnicos de la más alta calidad.
          </p>
          <div className="historia-icon-container">
            <div className="text-center">
              <div className="historia-icon-circle">
                <Calendar className="historia-icon" />
              </div>
              <p className="font-bold">Desde 1982</p>
            </div>
            <div className="text-center">
              <div className="historia-icon-circle">
                <Award className="historia-icon" />
              </div>
              <p className="font-bold">Premio a la Calidad</p>
            </div>
            <div className="text-center">
              <div className="historia-icon-circle">
                <Users className="historia-icon" />
              </div>
              <p className="font-bold">Negocio Familiar</p>
            </div>
          </div>
        </div>

        <div className="historia-timeline">
          <h3 className="historia-timeline-title">Nuestro Camino</h3>

          <div className="historia-timeline-container">
            <div className="historia-timeline-line"></div>

            <div className="historia-event">
              <div className="historia-event-flex">
                <div className="historia-event-left">
                  <h4 className="historia-event-year">1982</h4>
                  <p className="historia-event-text">Doña XXX fundó Carnicería la Bendición con un pequeño local y el sueño de ofrecer los mejores cortes de carne a su comunidad.</p>
                </div>
                <div className="historia-event-circle">
                  <span className="historia-event-number">1</span>
                </div>
                <div className="historia-event-right">
                  <div className="historia-event-image-container">
                    <div className="historia-event-image-placeholder">
                      <img src={require('../../assets/images/Duena-carniceria.png')} alt="Fundación de la carnicería" className="historia-event-image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="historia-event">
              <div className="historia-event-flex">
                <div className="historia-event-left">
                  <div className="historia-event-image-container">
                    <div className="historia-event-image-placeholder">
                      <img src={require('../../assets/images/expansion.png')} alt="Expansión del negocio" className="historia-event-image" />
                    </div>
                  </div>
                </div>
                <div className="historia-event-circle">
                  <span className="historia-event-number">2</span>
                </div>
                <div className="historia-event-right">
                  <h4 className="historia-event-year">1995</h4>
                  <p className="historia-event-text">Expansión del negocio con un local más amplio y la incorporación de nuevos productos artesanales como embutidos y adobados.</p>
                </div>
              </div>
            </div>

            <div className="historia-event">
              <div className="historia-event-flex">
                <div className="historia-event-left">
                  <h4 className="historia-event-year">2008</h4>
                  <p className="historia-event-text">La segunda generación de la familia Mendoza se une al negocio, aportando innovación y manteniendo la tradición de calidad.</p>
                </div>
                <div className="historia-event-circle">
                  <span className="historia-event-number">3</span>
                </div>
                <div className="historia-event-right">
                  <div className="historia-event-image-container">
                    <div className="historia-event-image-placeholder">
                      <img src={require('../../assets/images/tercera.png')} alt="Segunda generación" className="historia-event-image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="historia-event">
              <div className="historia-event-flex">
                <div className="historia-event-left">
                  <div className="historia-event-image-container">
                    <div className="historia-event-image-placeholder">
                      <img src={require('../../assets/images/actualmente.png')} alt="Actualidad" className="historia-event-image" />
                    </div>
                  </div>
                </div>
                <div className="historia-event-circle">
                  <span className="historia-event-number">4</span>
                </div>
                <div className="historia-event-right">
                  <h4 className="historia-event-year">Actualidad</h4>
                  <p className="historia-event-text">Hoy, Carnicería la Bendición es reconocida por su excelencia, ofreciendo cortes premium y atención personalizada a nuestros clientes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="historia-values">
          <h3 className="historia-values-title">Nuestros Valores</h3>
          <div className="historia-values-grid">
            <div className="historia-value-card">
              <div className="historia-value-icon-circle">
                <Award className="historia-value-icon" />
              </div>
              <h4 className="historia-value-title">Calidad</h4>
              <p className="historia-value-text">Seleccionamos las mejores carnes para garantizar el sabor y la frescura en cada corte.</p>
            </div>
            <div className="historia-value-card">
              <div className="historia-value-icon-circle">
                <Users className="historia-value-icon" />
              </div>
              <h4 className="historia-value-title">Familia</h4>
              <p className="historia-value-text">Negocio familiar que transmite el conocimiento y la pasión por generaciones.</p>
            </div>
            <div className="historia-value-card">
              <div className="historia-value-icon-circle">
                <Clock className="historia-value-icon" />
              </div>
              <h4 className="historia-value-title">Tradición</h4>
              <p className="historia-value-text">Mantenemos las técnicas tradicionales que dan ese sabor único a nuestros productos.</p>
            </div>
          </div>
        </div>

        <div className="historia-testimonial">
          <div className="historia-quote">"</div>
          <p className="historia-testimonial-text">
            Carnicería la Bendición no es solo un negocio, es nuestra pasión y orgullo. Cada día nos esforzamos por mantener viva la tradición que mi padre inició hace más de 40 años.
          </p>
          <div className="historia-testimonial-author">Carlos Mendoza</div>
          <div className="historia-testimonial-role">Director General, Segunda Generación</div>
        </div>

        <Resena />

        <div className="historia-location-info">
          <MapPin className="historia-location-icon" />
          <span>El cairo de Siquirres</span>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="historia-location-link">
            Cómo Llegar
          </a>
        </div>
      </div>
      <FooterApp />
    </div>
  );
};

export default Historia;