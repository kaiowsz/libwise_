import { getBookById } from "@/actions/book";
import Header from "@/components/Header";
import DeleteBookButton from "@/components/DeleteBookButton";
import { BookOpen, User, Calendar, FileText, ArrowLeft, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

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
              <a 
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#D1B898] hover:bg-[#c2a47e] text-black w-full px-8 py-4 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1"
              >
                <BookOpen className="w-5 h-5" />
                LER PDF AGORA
              </a>
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
              <div className="flex items-center gap-3 text-text-dimmed">
                <div className="bg-surface-elevated p-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Status</p>
                  <p className="font-medium text-white">{book.isAvailable ? "Disponível" : "Indisponível"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-text-dimmed">
                <div className="bg-surface-elevated p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Uploader</p>
                  <p className="font-medium text-white">{book.user?.name || book.user?.email || "Anônimo"}</p>
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
              <div className="pt-4 border-t border-border-dim/50">
                <DeleteBookButton bookId={book.id} />
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
