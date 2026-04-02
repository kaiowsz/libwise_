import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteBookButton from '@/components/DeleteBookButton';

// 1. mock da server action
vi.mock('@/actions/book', () => ({
  deleteBook: vi.fn(() => Promise.resolve()), 
}));

// 2. mock do useRouter do Nextjs
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("DeleteBookButton", () => {
  it("renders correctly with specific URL", () => {
    render(<DeleteBookButton bookId="123" />);
    
    const buttonLink = screen.getByRole('button', { name: /Deletar Livro/i });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent("Deletar Livro");
  });

  it("calls deleteBook when clicked", async () => {
    const { deleteBook } = await import('@/actions/book');
    
    render(<DeleteBookButton bookId="999" />);
    const buttonLink = screen.getByRole('button', { name: /Deletar Livro/i });

    fireEvent.click(buttonLink);

    const newButton = screen.getByText("Sim, deletar");
    expect(newButton).toBeInTheDocument();

    fireEvent.click(newButton);

    expect(deleteBook).toHaveBeenCalledTimes(1);
    expect(deleteBook).toHaveBeenCalledWith("999");
  });
});
