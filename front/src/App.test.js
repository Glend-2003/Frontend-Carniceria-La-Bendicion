// tests/integration/tipopago.simple.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TipoPagoApp from '../../src/components/TipoPago/TipoPagoApp';
import '@testing-library/jest-dom';

// Mock mínimo de axios y react-toastify
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

describe('TipoPago - Funcionalidad básica', () => {
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
    jest.clearAllMocks();
  });

  // PRUEBA 1: Listar tipos de pago
  test('Debe listar los tipos de pago correctamente', async () => {
    render(<TipoPagoApp />);

    // Verificar que se muestre el tipo de pago existente
    await waitFor(() => {
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
    });

    // Verificar que se hizo la petición GET
    expect(mockAxios.history.get.length).toBe(1);
  });

  // PRUEBA 2: Agregar nuevo tipo de pago
  test('Debe permitir agregar un nuevo tipo de pago', async () => {
    // Configurar mocks para agregar
    mockAxios.onPost(`${API_URL}/tipopago/agregar`).reply(201);
    mockAxios.onGet(`${API_URL}/tipopago/`).reply(200, [
      { idTipoPago: 1, descripcionTipoPago: 'Efectivo', estadoTipoPago: 1 },
      { idTipoPago: 2, descripcionTipoPago: 'Tarjeta', estadoTipoPago: 1 }
    ]);

    render(<TipoPagoApp />);

    // Esperar carga inicial
    await waitFor(() => screen.getByText('Efectivo'));

    // Abrir modal y agregar nuevo
    fireEvent.click(screen.getByText('Agregar nuevo tipo de pago'));
    fireEvent.change(
      await screen.findByPlaceholderText('Nombre del tipo de pago'),
      { target: { value: 'Tarjeta' } }
    );
    fireEvent.click(screen.getByText('Agregar'));

    // Verificar que se hizo el POST
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({
        descripcionTipoPago: 'Tarjeta'
      });
    });
  });
});