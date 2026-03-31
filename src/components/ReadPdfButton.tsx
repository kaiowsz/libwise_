"use client";

import { incrementViewCount } from "@/actions/book";
import { BookOpen } from "lucide-react";

interface ReadPdfButtonProps {
  bookId: string;
  pdfUrl: string;
}

export default function ReadPdfButton({ bookId, pdfUrl }: ReadPdfButtonProps) {
  const handleClick = () => {
    // Dispara a server action em background sem bloquear a navegação
    incrementViewCount(bookId).catch(() => {});
  };

  return (
    <a 
      href={pdfUrl}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="flex items-center justify-center gap-3 bg-[#D1B898] hover:bg-[#c2a47e] text-black w-full px-8 py-4 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1"
    >
      <BookOpen className="w-5 h-5" />
      LER PDF AGORA
    </a>
  );
}
