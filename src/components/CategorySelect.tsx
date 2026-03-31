"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategorySelectProps {
  categories: Category[];
  defaultValue?: string;
}

export default function CategorySelect({ categories, defaultValue = "" }: CategorySelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(value.toLowerCase())
  );

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
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-medium text-text-dimmed flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-primary-500" />
        Categoria
      </label>
      <div className="relative">
        <input
          type="text"
          name="category"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="ex: Ficção, Tecnologia, Ciência..."
          className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dimmed pointer-events-none" />

        {isOpen && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-border-dim rounded-sm shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setValue(cat.name);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-surface-raised transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-text-dimmed/60">
        Selecione uma existente ou digite uma nova categoria.
      </p>
    </div>
  );
}
