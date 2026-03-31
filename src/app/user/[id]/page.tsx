import { getUserById, getBooksByUser } from "@/actions/book";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import { ArrowLeft, BookOpen, Calendar, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return { title: "Usuário não encontrado | Libwise" };
  }

  const displayName = user.name || "Usuário";
  return {
    title: `${displayName} — Perfil | Libwise`,
    description: `Veja os livros enviados por ${displayName} na Libwise.`
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const user = await getUserById(id);
  if (!user) notFound();

  const { books, totalPages, currentPage: pg, totalCount } = await getBooksByUser({
    userId: id,
    page: currentPage,
  });

  const memberSince = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-dimmed hover:text-white transition-colors mb-10 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        {/* User Info */}
        <section className="mb-16">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-surface-elevated border border-border-dim flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-primary-500">
                {(user.name || user.email)?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {user.name || "Usuário Anônimo"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-dimmed">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Membro desde {memberSince}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {totalCount} livro{totalCount !== 1 ? "s" : ""} enviado{totalCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* User's Books */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-4">
            Livros Enviados
            <div className="flex-1 h-px bg-border-dim"></div>
          </h2>

          {books.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-dimmed text-lg">Este usuário ainda não enviou nenhum livro.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                {books.map((book: any) => (
                  <Link
                    href={`/book/${book.id}`}
                    key={book.id}
                    className="relative group aspect-[3/4] rounded-sm overflow-hidden border border-border-dim hover:border-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/20 transform hover:-translate-y-2 block"
                  >
                    <Image
                      src={
                        book.coverUrl ||
                        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=300&auto=format&fit=crop"
                      }
                      alt={book.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-4 gap-1">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-tight">
                        {book.author} {book.pages > 0 && `• ${book.pages} pages`}
                      </p>
                      {book.category && (
                        <span className="text-xs text-primary-500 font-medium">
                          {book.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination
                currentPage={pg}
                totalPages={totalPages}
                basePath={`/user/${id}`}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
