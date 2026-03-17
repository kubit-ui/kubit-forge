import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Your React App/i)).toBeInTheDocument();
  });

  it('renders kubit-forge message', () => {
    render(<App />);
    expect(screen.getByText(/Built with kubit-forge/i)).toBeInTheDocument();
  });
});
