import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders footer text correctly', () => {
    render(<Footer />);
    
    const textElement = screen.getByText(/© 2026 Portfolio Showcase. All rights reserved./i);
    expect(textElement).toBeInTheDocument();
  });
});
