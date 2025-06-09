// tests/integration/comentario.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ComentarioApp from '../../src/components/Comentario/ComentarioApp';
import '@testing-library/jest-dom';

// Mocks básicos
jest.mock('../../src/components/SideBar/SideBar', () => () => <div>SideBar</div>);
jest.mock('../../src/components/Footer/FooterApp', () => () => <div>Footer</div>);
jest.mock('../../src/hooks/useAuth', () => () => ({ 
  usuario: { 
    idUsuario: 1,
    nombre: 'Test User' 
  } 
}));
jest.mock('../../src/components/Paginacion/PaginacionApp', () => () => <div>Paginacion</div>);

jest.mock('react-toastify', () => ({
  toast: { 
    success: jest.fn(), 
    error: jest.fn() 
  },
  ToastContainer: () => null
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span>icon</span>
}));

describe('Comentario - Pruebas Básicas', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Mock datos iniciales de comentarios
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/comentario/admin').reply(200, [
      { 
        idComentario: 1, 
        descripcionComentario: 'Excelente servicio', 
        numCalificacion: 5,
        fechaComentario: '2024-01-01T10:00:00.000Z',
        correoUsuario: 'test@example.com',
        verificacion: 1
      }
    ]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // PRUEBA 1: Verificar funcionalidad de búsqueda
  test('Debe filtrar comentarios al escribir en el campo de búsqueda', async () => {
    // Agregar más comentarios para probar el filtro
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/comentario/admin').reply(200, [
      { 
        idComentario: 1, 
        
        numCalificacion: 5,
        fechaComentario: '2024-01-01T10:00:00.000Z',
        correoUsuario: 'test@example.com',
        verificacion: 1
      },
      { 
        idComentario: 2, 
        descripcionComentario: 'Muy buena atención', 
        numCalificacion: 4,
        fechaComentario: '2024-01-02T10:00:00.000Z',
        correoUsuario: 'user2@example.com',
        verificacion: 1
      }
    ]);

    render(<ComentarioApp />);

    // Esperar a que se carguen todos los comentarios
    await waitFor(() => {
      expect(screen.getByText('Excelente servicio')).toBeInTheDocument();
      expect(screen.getByText('Muy buena atención')).toBeInTheDocument();
    });

    // Buscar por "excelente"
    const searchInput = screen.getByPlaceholderText('Buscar comentario');
    fireEvent.change(searchInput, { target: { value: 'excelente' } });

    // Verificar que solo aparece el comentario filtrado
    expect(screen.getByText('Excelente servicio')).toBeInTheDocument();
    expect(screen.queryByText('Muy buena atención')).not.toBeInTheDocument();
  });

  // PRUEBA 2: Verificar cambio de estado de verificación
  test('Debe cambiar el estado de verificación de un comentario', async () => {
    // Mock para el cambio de estado
    mockAxios.onPut('https://backend-carniceria-la-bendicion-qcvr.onrender.com/comentario/verificar/1').reply(200);
    
    // Mock para recargar después del cambio
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/comentario/admin').reply(200, [
      { 
        idComentario: 1, 
        descripcionComentario: 'Excelente servicio', 
        numCalificacion: 5,
        fechaComentario: '2024-01-01T10:00:00.000Z',
        correoUsuario: 'test@example.com',
        verificacion: 0 // Cambió de 1 (visible) a 0 (oculto)
      }
    ]);

    render(<ComentarioApp />);

    // Esperar a que aparezcan los datos iniciales
    await waitFor(() => {
      expect(screen.getByText('Excelente servicio')).toBeInTheDocument();
    });

    // Buscar y hacer clic en el botón de estado "Visible"
    const stateButton = screen.getByText('Visible');
    fireEvent.click(stateButton);

    // Verificar que se hizo la petición PUT
    await waitFor(() => {
      expect(mockAxios.history.put).toHaveLength(1);
      expect(mockAxios.history.put[0].url).toBe('https://backend-carniceria-la-bendicion-qcvr.onrender.com/comentario/verificar/1');
    });

    // Verificar que se recarga la lista después del cambio
    expect(mockAxios.history.get).toHaveLength(2); // Carga inicial + recarga
  });
});