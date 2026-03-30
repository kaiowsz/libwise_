"use client";

import { deleteBook } from "@/actions/book";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(bookId);
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Erro ao deletar o livro.");
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-red-400">Tem certeza?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-sm transition-all disabled:opacity-50"
        >
          {deleting ? "Deletando..." : "Sim, deletar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="px-4 py-2 text-sm font-semibold bg-surface-elevated text-text-dimmed hover:text-white border border-border-dim rounded-sm transition-all"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-sm transition-all hover:bg-red-500/10"
    >
      <Trash2 className="w-4 h-4" />
      Deletar Livro
    </button>
  );
}
