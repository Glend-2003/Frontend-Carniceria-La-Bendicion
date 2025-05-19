import React from 'react';
import PropTypes from "prop-types";
import './PaginacionApp.css'; 
const PaginacionApp = ({ currentPage, totalPages, onPageChange, onNextPage, onPreviousPage }) => {
    return (
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={onPreviousPage}>
                Anterior
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button onClick={() => onPageChange(index + 1)} className="page-link">
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={onNextPage}>
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
};

PaginacionApp.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onNextPage: PropTypes.func.isRequired,
    onPreviousPage: PropTypes.func.isRequired,
};

export default PaginacionApp;