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

describe('TipoPago - Integración', () => {
  let mockAxios;
  const API_URL = 'https://backend-carniceria-la-bendicion-qcvr.onrender.com';

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Datos iniciales
    mockAxios.onGet(`${API_URL}/tipopago/`).reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 1 }
    ]);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // PRUEBA 1: Agregar tipo de pago
  test('Debe agregar un nuevo tipo de pago', async () => {
    // Mock para agregar
    mockAxios.onPost(`${API_URL}/tipopago/agregar`).reply(201);

    render(<TipoPagoApp />);

    // Esperar carga
    await waitFor(() => screen.getByText('Efectivo'));

    // Abrir modal
    fireEvent.click(screen.getByText('Agregar nuevo tipo de pago'));

    // Llenar formulario
    const input = screen.getByPlaceholderText('Nombre del tipo de pago');
    fireEvent.change(input, { target: { value: 'Tarjeta' } });

    // Enviar
    fireEvent.click(screen.getByText('Agregar'));

    // Verificar petición
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${API_URL}/tipopago/agregar`);
    });
  });

  // PRUEBA 2: Validar duplicados
  test('No debe permitir tipos de pago duplicados', async () => {
    render(<TipoPagoApp />);

    await waitFor(() => screen.getByText('Efectivo'));

    // Abrir modal
    fireEvent.click(screen.getByText('Agregar nuevo tipo de pago'));

    // Intentar agregar duplicado
    const input = screen.getByPlaceholderText('Nombre del tipo de pago');
    fireEvent.change(input, { target: { value: 'Efectivo' } });

    fireEvent.click(screen.getByText('Agregar'));

    // No debe hacer petición
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(0);
    });
  });

  // PRUEBA 3: Cambiar estado
  test('Debe cambiar el estado de un tipo de pago', async () => {
    // Mock para cambio de estado
    mockAxios.onPut(/\/tipopago\/activar\/\d+/).reply(200);

    render(<TipoPagoApp />);

    await waitFor(() => screen.getByText('Efectivo'));

    // Hacer clic en botón de estado
    fireEvent.click(screen.getByText('Activo'));

    // Verificar petición
    await waitFor(() => {
      expect(mockAxios.history.put).toHaveLength(1);
      expect(mockAxios.history.put[0].url).toMatch(/\/tipopago\/activar\/\d+/);
    });
  });
});