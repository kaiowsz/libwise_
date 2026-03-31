import { getBookById, getCategories } from "@/actions/book";
import Header from "@/components/Header";
import EditBookForm from "@/components/EditBookForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, { userId }, categories] = await Promise.all([
    getBookById(id),
    auth(),
    getCategories(),
  ]);

  if (!book) notFound();
  if (!userId || book.userId !== userId) redirect(`/book/${id}`);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-16 flex justify-center">
        <div className="w-full max-w-xl">
          <Link
            href={`/book/${id}`}
            className="inline-flex items-center gap-2 text-text-dimmed hover:text-white transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para detalhes
          </Link>

          <div className="bg-surface-base p-8 rounded-sm border border-border-dim shadow-2xl">
            <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Editar Livro</h1>
            <EditBookForm
              book={{
                id: book.id,
                title: book.title,
                author: book.author,
                summary: book.summary,
                category: book.category,
              }}
              categories={categories}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
