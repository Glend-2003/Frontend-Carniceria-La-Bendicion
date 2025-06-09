// tests/integration/tipopago.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TipoPagoApp from '../../src/components/TipoPago/TipoPagoApp';
import '@testing-library/jest-dom';

// Mocks simples
jest.mock('../../src/components/SideBar/SideBar', () => () => <div>SideBar</div>);
jest.mock('../../src/components/Footer/FooterApp', () => () => <div>Footer</div>);
jest.mock('../../src/hooks/useAuth', () => () => ({ usuario: { id: 1 } }));
jest.mock('../../src/components/Paginacion/PaginacionApp', () => () => <div>Paginacion</div>);
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
  ToastContainer: () => null
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/tipopago'
  })
}));

// Mock de SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true })
}));

describe('TipoPago - Integración', () => {
  let mockAxios;
  const API_URL = 'https://backend-carniceria-la-bendicion-qcvr.onrender.com';

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Datos iniciales
    mockAxios.onGet(`${API_URL}/tipopago/`).reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 1 }
    ]);
    
    // Limpiar mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // PRUEBA 1: Agregar tipo de pago
  test('Debe agregar un nuevo tipo de pago', async () => {
    // Mock para agregar
    mockAxios.onPost(`${API_URL}/tipopago/agregar`).reply(201);
    // Mock para recargar después de agregar
    mockAxios.onGet(`${API_URL}/tipopago/`).reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 1 },
      { idTipoPago: 2, descripcionTipoPago: 'Tarjeta', estadoTipoPago: 1 }
    ]);

    render(<TipoPagoApp />);

    // Esperar carga inicial
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Abrir modal de agregar
    const addButton = screen.getByText('Agregar nuevo tipo de pago');
    fireEvent.click(addButton);

    // Llenar formulario
    const input = await waitFor(() => 
      screen.getByPlaceholderText('Nombre del tipo de pago')
    );
    fireEvent.change(input, { target: { value: 'Tarjeta' } });

    // Enviar formulario
    const submitButton = screen.getByText('Agregar');
    fireEvent.click(submitButton);

    // Verificar petición
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${API_URL}/tipopago/agregar`);
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.descripcionTipoPago).toBe('Tarjeta');
    });
  });

  // PRUEBA 2: Validar duplicados
  test('No debe permitir tipos de pago duplicados', async () => {
    render(<TipoPagoApp />);

    // Esperar carga inicial
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Abrir modal de agregar
    const addButton = screen.getByText('Agregar nuevo tipo de pago');
    fireEvent.click(addButton);

    // Intentar agregar duplicado
    const input = await waitFor(() => 
      screen.getByPlaceholderText('Nombre del tipo de pago')
    );
    fireEvent.change(input, { target: { value: 'Efectivo' } });

    const submitButton = screen.getByText('Agregar');
    fireEvent.click(submitButton);

    // Verificar que no se haga petición POST
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(0);
    });

    // Verificar que se muestre mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/ya existe/i)).toBeInTheDocument();
    });
  });

  // PRUEBA 3: Cambiar estado
  test('Debe cambiar el estado de un tipo de pago', async () => {
    // Mock para cambio de estado
    mockAxios.onPut(`${API_URL}/tipopago/activar/1`).reply(200);
    // Mock para recargar después del cambio
    mockAxios.onGet(`${API_URL}/tipopago/`).reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 0 }
    ]);

    render(<TipoPagoApp />);

    // Esperar carga inicial
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Buscar y hacer clic en botón de estado
    const stateButton = screen.getByText('Activo');
    fireEvent.click(stateButton);

    // Verificar petición
    await waitFor(() => {
      expect(mockAxios.history.put).toHaveLength(1);
      expect(mockAxios.history.put[0].url).toBe(`${API_URL}/tipopago/activar/1`);
    });
  });

  // PRUEBA 4: Cargar datos iniciales
  test('Debe cargar y mostrar los tipos de pago iniciales', async () => {
    render(<TipoPagoApp />);

    // Verificar que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Verificar que se haya hecho la petición GET
    expect(mockAxios.history.get).toHaveLength(1);
    expect(mockAxios.history.get[0].url).toBe(`${API_URL}/tipopago/`);
  });

  // PRUEBA 5: Manejar errores de red
  test('Debe manejar errores de red correctamente', async () => {
    // Mock para error en carga inicial
    mockAxios.onGet(`${API_URL}/tipopago/`).networkError();

    render(<TipoPagoApp />);

    // Verificar que se maneje el error
    await waitFor(() => {
      expect(mockAxios.history.get).toHaveLength(1);
    });
  });
});