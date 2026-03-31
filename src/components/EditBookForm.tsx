"use client";

import { updateBook } from "@/actions/book";
import CategorySelect from "@/components/CategorySelect";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface BookData {
  id: string;
  title: string;
  author: string;
  summary: string | null;
  category: Category | null;
}

interface EditBookFormProps {
  book: BookData;
  categories: Category[];
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#D1B898] hover:bg-[#c2a47e] text-black px-8 py-3.5 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Salvando..." : "Salvar Alterações"}
    </button>
  );
}

export default function EditBookForm({ book, categories }: EditBookFormProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function action(formData: FormData) {
    try {
      setError(null);
      await updateBook(book.id, formData);
      router.push(`/book/${book.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações.");
    }
  }

  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-dimmed">Título</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={book.title}
          className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-dimmed">Autor</label>
        <input
          type="text"
          name="author"
          required
          defaultValue={book.author}
          className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-dimmed">Resumo</label>
        <textarea
          name="summary"
          rows={5}
          defaultValue={book.summary || ""}
          className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
        />
      </div>

      <CategorySelect categories={categories} defaultValue={book.category?.name || ""} />

      <div className="pt-4">
        <SaveButton />
      </div>
    </form>
  );
}
