import { render, screen } from '@testing-library/react';
import App from './App';
import LoginApp from './components/Login/LoginApp';

test('renders learn react link', () => {
  render(<LoginApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
