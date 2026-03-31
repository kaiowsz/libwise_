import { getBookById, incrementViewCount } from "@/actions/book";
import Header from "@/components/Header";
import DeleteBookButton from "@/components/DeleteBookButton";
import ReadPdfButton from "@/components/ReadPdfButton";
import { BookOpen, User, Calendar, FileText, ArrowLeft, Tag, Eye, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    return { title: "Livro não encontrado | Libwise" };
  }

  return {
    title: `${book.title} — ${book.author} | Libwise`,
    description: book.summary?.slice(0, 160) || `Leia ${book.title} por ${book.author} na Libwise.`,
    openGraph: {
      title: `${book.title} — ${book.author}`,
      description: book.summary?.slice(0, 160) || `Leia ${book.title} na Libwise.`,
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
      type: "article",
    },
  };
}

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, { userId }] = await Promise.all([getBookById(id), auth()]);

  if (!book) {
    notFound();
  }

  const isOwner = userId === book.userId;

  // Format date
  const uploadDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(book.createdAt));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-text-dimmed hover:text-white transition-colors mb-8 md:mb-12 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
          {/* Cover */}
          <div className="w-full max-w-[320px] md:max-w-[400px] mx-auto md:mx-0 shrink-0">
            <div className="relative group aspect-3/4 rounded-sm overflow-hidden border border-border-dim shadow-2xl">
              <Image 
                src={book.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop"} 
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="mt-8">
              <ReadPdfButton bookId={book.id} pdfUrl={book.pdfUrl} />
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 flex flex-col pt-2 md:pt-6">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
                {book.title}
              </h1>
              <p className="text-xl md:text-2xl text-primary-500 font-medium">
                Por {book.author}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 py-6 border-y border-border-dim/50 mb-8">
              {book.category && (
                <div className="flex items-center gap-3 text-text-dimmed">
                  <div className="bg-surface-elevated p-2 rounded-full">
                    <Tag className="w-5 h-5 text-[#D1B898]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Categoria</p>
                    <Link href={`/?category=${book.category.id}`} className="font-medium text-white hover:text-primary-500 transition-colors">
                      {book.category.name}
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-text-dimmed">
                <div className="bg-surface-elevated p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Uploader</p>
                  <Link href={`/user/${book.userId}`} className="font-medium text-white hover:text-primary-500 transition-colors">
                    {book.user?.name || book.user?.email || "Anônimo"}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3 text-text-dimmed">
                <div className="bg-surface-elevated p-2 rounded-full">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Enviado em</p>
                  <p className="font-medium text-white">{uploadDate}</p>
                </div>
              </div>

              {book.pages && (
                <div className="flex items-center gap-3 text-text-dimmed">
                  <div className="bg-surface-elevated p-2 rounded-full">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Páginas</p>
                    <p className="font-medium text-white">{book.pages}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-text-dimmed">
                <div className="bg-surface-elevated p-2 rounded-full">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Visualizações</p>
                  <p className="font-medium text-white">{book.viewCount ?? 0}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pb-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-4">
                Resumo
                <div className="flex-1 h-px bg-border-dim"></div>
              </h3>
              <div className="text-text-dimmed text-lg leading-relaxed whitespace-pre-line">
                {book.summary || "Nenhum resumo disponível para este livro."}
              </div>
            </div>

            {isOwner && (
              <div className="pt-4 border-t border-border-dim/50 flex flex-wrap items-center gap-3">
                <Link
                  href={`/book/${book.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-500 hover:text-white border border-primary-500/30 hover:border-primary-500/60 rounded-sm transition-all hover:bg-primary-500/10 mt-4"
                >
                  <Pencil className="w-4 h-4" />
                  Editar Livro
                </Link>
                <DeleteBookButton bookId={book.id} />
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
