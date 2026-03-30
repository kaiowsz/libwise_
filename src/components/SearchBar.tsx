"use client";

import { searchBooks } from "@/actions/book";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

type BookResult = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  pages: number | null;
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  //@ts-ignore
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const books = await searchBooks(query);
      setResults(books);
      setIsOpen(true);
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
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dimmed pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Buscar livros, autores..."
          className="w-full bg-surface-elevated border border-border-dim rounded-full py-2 pl-10 pr-10 text-sm text-text-main placeholder:text-text-dimmed focus:outline-none focus:border-border-glow focus:ring-1 focus:ring-primary-500 transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dimmed hover:text-white transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border-dim rounded-lg shadow-2xl overflow-hidden z-[100] max-h-[420px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-text-dimmed text-sm">
              Nenhum livro encontrado para &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {results.map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-raised transition-colors border-b border-border-dim/50 last:border-b-0"
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
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary-500 hover:text-white py-3 font-medium border-t border-border-dim/50 hover:bg-surface-raised transition-colors"
              >
                Ver todos os resultados →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
