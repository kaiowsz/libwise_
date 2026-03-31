import { searchBooks } from "@/actions/book";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import Image from "next/image";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page } = await searchParams;
  const query = q?.trim() || "";
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const { books: results, totalPages, currentPage: pg, totalCount } = query.length >= 2
    ? await searchBooks({ query, page: currentPage })
    : { books: [], totalPages: 0, currentPage: 1, totalCount: 0 };

  const paginationBase = `/search?q=${encodeURIComponent(query)}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Resultados para &ldquo;{query}&rdquo;
          </h1>
          <p className="text-text-dimmed text-sm">
            {totalCount} livro{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-text-dimmed text-lg mb-4">Nenhum livro encontrado.</p>
            <Link href="/" className="text-primary-500 hover:text-white transition-colors font-medium">
              ← Voltar para Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {results.map((book) => (
                <Link
                  href={`/book/${book.id}`}
                  key={book.id}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-border-dim hover:border-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/20 transform hover:-translate-y-2">
                    <Image
                      src={book.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop"}
                      alt={book.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-text-dimmed text-xs mt-1">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination currentPage={pg} totalPages={totalPages} basePath={paginationBase} />
          </>
        )}
      </main>
    </div>
  );
}
