// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock global para react-bootstrap
jest.mock('react-bootstrap', () => {
  const MockModal = ({ children, show, onHide, className, size, centered }) => {
    if (!show) return null;
    return (
      <div 
        data-testid="modal" 
        className={className} 
        data-size={size}
        data-centered={centered}
      >
        <div onClick={onHide} data-testid="modal-backdrop" />
        {children}
      </div>
    );
  };

  MockModal.Header = ({ children, closeButton, className, style }) => (
    <div data-testid="modal-header" className={className} style={style}>
      {children}
      {closeButton && <button data-testid="close-button">×</button>}
    </div>
  );

  MockModal.Title = ({ children }) => (
    <h4 data-testid="modal-title">{children}</h4>
  );

  MockModal.Body = ({ children, className }) => (
    <div data-testid="modal-body" className={className}>{children}</div>
  );

  MockModal.Footer = ({ children }) => (
    <div data-testid="modal-footer">{children}</div>
  );

  return {
    Button: ({ children, onClick, className, variant, type }) => (
      <button 
        onClick={onClick} 
        className={className}
        data-variant={variant} 
        type={type}
      >
        {children}
      </button>
    ),
    Modal: MockModal
  };
});

// Mock para window.matchMedia que es requerido por algunos componentes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para console.error para evitar warnings innecesarios en tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock global para fetch si es necesario
global.fetch = jest.fn();

// Configuración adicional para React 18
global.IS_REACT_ACT_ENVIRONMENT = true;