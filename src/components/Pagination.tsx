import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/" or "/search?q=foo"
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = basePath.includes("?") ? "&" : "?";
  const buildHref = (page: number) => `${basePath}${separator}page=${page}`;

  return (
    <div className="flex items-center justify-center gap-4 pt-12">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-dimmed hover:text-white border border-border-dim hover:border-border-glow rounded-sm transition-all hover:bg-surface-elevated"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-dimmed/30 border border-border-dim/30 rounded-sm cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </span>
      )}

      <span className="text-sm text-text-dimmed tabular-nums">
        <span className="text-white font-semibold">{currentPage}</span> de <span className="text-white font-semibold">{totalPages}</span>
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-dimmed hover:text-white border border-border-dim hover:border-border-glow rounded-sm transition-all hover:bg-surface-elevated"
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-dimmed/30 border border-border-dim/30 rounded-sm cursor-not-allowed">
          Próximo
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
