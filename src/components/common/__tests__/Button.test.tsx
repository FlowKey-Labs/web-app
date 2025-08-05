import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import Button from '../Button';
import React from 'react';

// Mock react-icons to avoid loading the actual icons in tests
jest.mock('react-icons/fi', () => ({
  FiArrowRight: () => <span data-testid="mock-arrow-right" />,
  FiCheck: () => <span data-testid="mock-check" />
}));

// Import the mocked icons after setting up the mock
import { FiArrowRight, FiCheck } from 'react-icons/fi';

// Custom render function that includes MantineProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('Button Component', () => {
  it('renders button with default props', () => {
    renderWithProvider(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mantine-Button-root');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  it('applies correct variant and color', () => {
    const { rerender } = renderWithProvider(
      <Button variant="outline" color="#FF0000">
        Outline Red
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /outline red/i });
    expect(button).toHaveAttribute('data-variant', 'outline');
    
    rerender(
      <MantineProvider>
        <Button variant="filled" color="#1D9B5E">
          Filled Green
        </Button>
      </MantineProvider>
    );
    
    expect(button).toHaveAttribute('data-variant', 'filled');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithProvider(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    renderWithProvider(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-loading');
    expect(button).toBeDisabled();
  });

  it('disables the button when disabled prop is true', () => {
    renderWithProvider(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('renders with left and right sections', () => {
    const { getByRole } = renderWithProvider(
      <Button 
        leftSection={<FiCheck data-testid="left-icon" />}
        rightSection={<FiArrowRight data-testid="right-icon" />}
      >
        With Icons
      </Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveAttribute('data-with-left-section', 'true');
    expect(button).toHaveAttribute('data-with-right-section', 'true');
  });

  it('applies fullWidth when fullWidth prop is true', () => {
    const { getByTestId } = renderWithProvider(
      <div style={{ width: '500px' }}>
        <Button fullWidth data-testid="full-width-button">Full Width</Button>
      </div>
    );
    
    const button = getByTestId('full-width-button');
    
    // In Mantine v7, fullWidth is applied as data-block="true"
    expect(button).toHaveAttribute('data-block', 'true');
  });

  it('handles mouse enter and leave events', () => {
    const handleMouseEnter = jest.fn();
    const handleMouseLeave = jest.fn();
    
    renderWithProvider(
      <Button 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Hover me
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /hover me/i });
    
    fireEvent.mouseEnter(button);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    
    fireEvent.mouseLeave(button);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('applies custom radius', () => {
    const { getByRole } = renderWithProvider(<Button radius="xl">Rounded</Button>);
    
    const button = getByRole('button', { name: /rounded/i });
    expect(button).toHaveStyle({ '--button-radius': 'var(--mantine-radius-xl)' });
  });
});
