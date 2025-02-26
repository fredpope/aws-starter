import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  it('renders the welcome message', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome to Next.js on Lambda!');
  });
});
