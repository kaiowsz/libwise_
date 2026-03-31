"use client";

import { searchBooks } from "@/actions/book";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, KeyboardEvent, ChangeEvent } from "react";
import { createPortal } from "react-dom";

type BookResult = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  pages: number | null;
};

export default function MobileSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  //@ts-ignore
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Lock body scroll when open and handle resize to close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => { 
      document.body.style.overflow = ""; 
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const { books } = await searchBooks({ query: q });
      setResults(books);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      close();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") close();
  };

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <>
      {/* Trigger button — visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-text-dimmed hover:text-white transition-colors"
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Fullscreen overlay */}
      {mounted && isOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[200] bg-surface-base/98 backdrop-blur-md flex flex-col h-[100dvh]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-dim bg-surface-base/50">
            <Search className="w-5 h-5 text-text-dimmed shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Buscar livros, autores..."
              className="flex-1 bg-transparent text-white text-lg placeholder:text-text-dimmed focus:outline-none"
            />
            <button onClick={close} className="p-1 text-text-dimmed hover:text-white transition-colors">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto bg-surface-base">
            {query.trim().length >= 2 && results.length === 0 && !isLoading && (
              <div className="p-8 text-center text-text-dimmed">
                Nenhum livro encontrado para &ldquo;{query}&rdquo;
              </div>
            )}

            {results.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                onClick={close}
                className="flex items-center gap-4 px-4 py-3 hover:bg-surface-elevated transition-colors border-b border-border-dim/30"
              >
                <div className="relative w-10 h-14 rounded-sm overflow-hidden shrink-0 border border-border-dim">
                  <Image
                    src={book.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop"}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{book.title}</p>
                  <p className="text-xs text-text-dimmed truncate">{book.author}</p>
                </div>
                {book.pages && (
                  <span className="text-xs text-text-dimmed whitespace-nowrap">{book.pages} pgs</span>
                )}
              </Link>
            ))}

            {results.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={close}
                className="block text-center text-sm text-primary-500 hover:text-white py-4 font-medium border-t border-border-dim/50 hover:bg-surface-elevated transition-colors"
              >
                Ver todos os resultados →
              </Link>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
