// tests/integration/categoria.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import CategoriaApp from '../../src/components/Categoria/CategoriaApp';
import '@testing-library/jest-dom';

// Mocks básicos
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
    // Mock datos iniciales de categorías
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/categoria/').reply(200, [
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

  // PRUEBA 1: Verificar validación de campos al agregar
  test('Debe validar campos obligatorios al intentar agregar una categoría', async () => {
    const { toast } = require('react-toastify');
    
    render(<CategoriaApp />);

    // Esperar a que se carguen los datos iniciales
    await waitFor(() => {
      expect(screen.getByText('Carnes Rojas')).toBeInTheDocument();
    });

    // Hacer clic en "Agregar nueva categoría"
    const addButton = screen.getByText('Agregar nueva categoría');
    fireEvent.click(addButton);

    // Esperar a que aparezca el modal
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Intentar enviar formulario vacío
    const submitButton = screen.getByText('Agregar');
    fireEvent.click(submitButton);

    // Verificar que se muestra error de validación
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Todos los campos son obligatorios y no pueden estar vacíos o contener solo espacios'
      );
    });

    // Verificar que NO se hace petición POST
    expect(mockAxios.history.post).toHaveLength(0);
  });

  // PRUEBA 2: Verificar eliminación de categoría
  test('Debe eliminar una categoría correctamente', async () => {
    const Swal = require('sweetalert2');
    
    // Mock para confirmación de eliminación
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    
    // Mock para la eliminación
    mockAxios.onDelete('https://backend-carniceria-la-bendicion-qcvr.onrender.com/categoria/eliminar/1').reply(200);
    
    // Mock para recargar después de eliminar
    mockAxios.onGet('https://backend-carniceria-la-bendicion-qcvr.onrender.com/categoria/').reply(200, []);

    render(<CategoriaApp />);

    // Esperar a que aparezcan los datos iniciales
    await waitFor(() => {
      expect(screen.getByText('Carnes Rojas')).toBeInTheDocument();
    });

    // Buscar y hacer clic en el botón de eliminar
    const deleteButtons = screen.getAllByTitle('Eliminar categoria');
    fireEvent.click(deleteButtons[0]);

    // Verificar que se muestra el SweetAlert de confirmación
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: "¿Estás seguro?",
        text: "No podrás revertir esto.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar",
        reverseButtons: true,
      });
    });

    // Verificar que se hizo la petición DELETE
    await waitFor(() => {
      expect(mockAxios.history.delete).toHaveLength(1);
      expect(mockAxios.history.delete[0].url).toBe('https://backend-carniceria-la-bendicion-qcvr.onrender.com/categoria/eliminar/1');
    });

    // Verificar que se recarga la lista después de eliminar
    expect(mockAxios.history.get).toHaveLength(2); // Carga inicial + recarga
  });
});