// tests/integration/registrar.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Registrar from '../../src/components/Usuarios/Registrar';
import '@testing-library/jest-dom';

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock de Material-UI simplificado
jest.mock('@mui/material/Snackbar', () => ({ children, open }) => 
  open ? <div data-testid="snackbar">{children}</div> : null
);

jest.mock('@mui/material/Alert', () => ({ children, severity, onClose }) => (
  <div data-testid="alert" data-severity={severity}>
    <button onClick={onClose}>×</button>
    {children}
  </div>
));

jest.mock('../../src/components/Footer/FooterApp', () => () => <div>Footer</div>);

// Wrapper para BrowserRouter
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Registrar - Pruebas Básicas', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // PRUEBA 1: Verificar validación de correo electrónico
  test('Debe validar formato de correo electrónico en tiempo real', async () => {
    renderWithRouter(<Registrar />);

    // Buscar el campo de correo
    const emailInput = screen.getByLabelText('Correo Electrónico');

    // Escribir un correo inválido
    fireEvent.change(emailInput, { target: { value: 'correo_invalido@dominiofalso.xyz' } });

    // Verificar que aparece el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Por favor ingrese un correo electrónico válido')).toBeInTheDocument();
    });

    // Escribir un correo válido
    fireEvent.change(emailInput, { target: { value: 'usuario@gmail.com' } });

    // Verificar que el error desaparece
    await waitFor(() => {
      expect(screen.queryByText('Por favor ingrese un correo electrónico válido')).not.toBeInTheDocument();
    });
  });

  // PRUEBA 2: Verificar registro exitoso
  test('Debe registrar usuario exitosamente con datos válidos', async () => {
    // Mock para registro exitoso
    mockAxios.onPost('https://backend-carniceria-la-bendicion-qcvr.onrender.com/usuario/registrar').reply(200, {
      message: 'Usuario registrado exitosamente'
    });

    renderWithRouter(<Registrar />);

    // Llenar todos los campos del formulario usando labels
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@gmail.com' }
    });
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Juan' }
    });
    fireEvent.change(screen.getByLabelText('Primer Apellido'), {
      target: { value: 'Pérez' }
    });
    fireEvent.change(screen.getByLabelText('Segundo Apellido'), {
      target: { value: 'García' }
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'MiPassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'MiPassword123' }
    });

    // Enviar formulario
    const submitButton = screen.getByText('Crear Cuenta');
    fireEvent.click(submitButton);

    // Verificar que se hizo la petición POST con los datos correctos
    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe('https://backend-carniceria-la-bendicion-qcvr.onrender.com/usuario/registrar');
      
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.correoUsuario).toBe('test@gmail.com');
      expect(requestData.nombreUsuario).toBe('Juan');
      expect(requestData.primerApellido).toBe('Pérez');
      expect(requestData.segundoApellido).toBe('García');
      expect(requestData.contraseniaUsuario).toBe('MiPassword123');
    });

    // Verificar que aparece mensaje de éxito
    await waitFor(() => {
      expect(screen.getByTestId('snackbar')).toBeInTheDocument();
      expect(screen.getByText('¡Usuario registrado con éxito! Redirigiendo...')).toBeInTheDocument();
    });
  });
});