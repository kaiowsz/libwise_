import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReadPdfButton from '@/components/ReadPdfButton';

// 1. mock da server action
vi.mock('@/actions/book', () => ({
  incrementViewCount: vi.fn(() => Promise.resolve()), 
}));

describe("ReadPdfButton", () => {
  it("renders correctly with specific URL", () => {
    render(<ReadPdfButton bookId="123" pdfUrl="https://meusite.com/arquivos/livro.pdf" />);
    
    const buttonLink = screen.getByRole('link', { name: /LER PDF AGORA/i });
    expect(buttonLink).toBeInTheDocument();
    expect(buttonLink).toHaveTextContent("LER PDF AGORA");
    expect(buttonLink).toHaveAttribute('href', 'https://meusite.com/arquivos/livro.pdf');
  });

  it("calls incrementViewCount when clicked", async () => {
    const { incrementViewCount } = await import('@/actions/book');
    
    render(<ReadPdfButton bookId="999" pdfUrl="/test.pdf" />);
    const buttonLink = screen.getByRole('link', { name: /LER PDF AGORA/i });

    fireEvent.click(buttonLink);

    expect(incrementViewCount).toHaveBeenCalledWith("999");
  });
});
