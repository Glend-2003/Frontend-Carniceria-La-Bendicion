// tests/integration/tipopago.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TipoPagoApp from '../../src/components/TipoPago/TipoPagoApp';
import '@testing-library/jest-dom';

// Mocks básicos
jest.mock('../../src/components/SideBar/SideBar', () => () => <div>SideBar</div>);
jest.mock('../../src/components/Footer/FooterApp', () => () => <div>Footer</div>);
jest.mock('../../src/hooks/useAuth', () => () => ({ usuario: { id: 1 } }));
jest.mock('../../src/components/Paginacion/PaginacionApp', () => () => <div>Paginacion</div>);

jest.mock('react-toastify', () => ({
  toast: { 
    success: jest.fn(), 
    error: jest.fn() 
  },
  ToastContainer: () => null
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span>icon</span>
}));

jest.mock('react-bootstrap', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Modal: ({ children, show }) => show ? <div data-testid="modal">{children}</div> : null,
  'Modal.Header': ({ children }) => <div>{children}</div>,
  'Modal.Title': ({ children }) => <h4>{children}</h4>,
  'Modal.Body': ({ children }) => <div>{children}</div>
}));

describe('TipoPago - Pruebas Básicas', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Mock datos iniciales
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/tipopago/').reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 1 }
    ]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // PRUEBA 1: Verificar que se carga la página
  test('Debe cargar la página y mostrar el título', async () => {
    render(<TipoPagoApp />);

    // Verificar que aparece el título
    expect(screen.getByText('Gestión de tipos de pago')).toBeInTheDocument();
    
    // Verificar que aparece el botón de agregar
    expect(screen.getByText('Agregar nuevo tipo de pago')).toBeInTheDocument();
  });

  // PRUEBA 2: Verificar que se cargan los datos desde la API
  test('Debe cargar y mostrar los tipos de pago desde la API', async () => {
    render(<TipoPagoApp />);

    // Esperar a que aparezcan los datos
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Verificar que se hizo la petición a la API
    expect(mockAxios.history.get).toHaveLength(1);
    expect(mockAxios.history.get[0].url).toBe('https://backend-carniceria-la-bendicion-qcvr.onrender.com/tipopago/');
  });
});