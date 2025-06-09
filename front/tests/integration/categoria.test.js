import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import CategoriaApp from '../../src/components/Categoria/CategoriaApp';
import '@testing-library/jest-dom';

jest.mock('../../src/components/SideBar/SideBar', () => () => <div>SideBar</div>);
jest.mock('../../src/components/Footer/FooterApp', () => () => <div>Footer</div>);
jest.mock('../../src/hooks/useAuth', () => () => ({ 
  usuario: { 
    idUsuario: 1,
    nombre: 'Test User' 
  },
  handleLogout: jest.fn()
}));
jest.mock('../../src/components/Paginacion/PaginacionApp', () => () => <div>Paginacion</div>);

jest.mock('react-toastify', () => ({
  toast: { 
    success: jest.fn(), 
    error: jest.fn() 
  },
  ToastContainer: () => null
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true })
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span>icon</span>
}));

describe('Categoria - Pruebas Básicas', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/categoria/', {
      params: { estadoCategoria: 0 }
    }).reply(200, [
      { 
        idCategoria: 1, 
        nombreCategoria: 'Carnes Rojas', 
        descripcionCategoria: 'Carnes de res y cerdo de alta calidad',
        estadoCategoria: 1
      }
    ]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  test('Debe validar campos obligatorios al intentar agregar una categoría', async () => {
    const { toast } = require('react-toastify');
    
    render(<CategoriaApp />);

    await waitFor(() => {
      expect(screen.getByText('Carnes Rojas')).toBeInTheDocument();
    }, { timeout: 5000 });

    const addButton = screen.getByText('Agregar nueva categoría');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
    }, { timeout: 5000 });

    const submitButton = screen.getByRole('button', { name: 'Agregar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Todos los campos son obligatorios y no pueden estar vacíos o contener solo espacios'
      );
    }, { timeout: 5000 });

    expect(mockAxios.history.post).toHaveLength(0);
  });
});