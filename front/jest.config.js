module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': require.resolve('axios') // Añade esta línea para manejar mejor axios
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // Patrón más limpio
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@fortawesome|sweetalert2|react-toastify|@mui|@emotion|lucide-react)/)', // Añadí lucide-react por si acaso
    '\\.pnp\\.[^\\/]+$'
  ],
  testMatch: [
    "**/tests/integration/**/*.{spec,test}.{js,jsx,ts,tsx}", // Más específico
    "**/__tests__/**/*.{js,jsx,ts,tsx}" // Añadido para convención común
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.{js,jsx,ts,tsx}',
    '!src/reportWebVitals.{js,jsx,ts,tsx}',
    '!src/setupTests.{js,jsx,ts,tsx}'
  ],
  testTimeout: 10000,
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true // Útil si usas TypeScript
    }
  }
};