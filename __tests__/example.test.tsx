import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Initial Setup', () => {
  it('renders a simple greeting', () => {
    render(<div>Hello Vitest!</div>);
    expect(screen.getByText('Hello Vitest!')).toBeInTheDocument();
  });
});
