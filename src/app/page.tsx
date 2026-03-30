import Header from "@/components/Header";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import { getBooks } from "@/actions/book";
import Link from "next/link";

export default async function Home() {
  const { mainBook, latestBooks, allBooksCount } = await getBooks();

  if (!mainBook) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Your library is empty</h1>
          <p className="text-text-dimmed mb-8">Start uploading some books to see them here.</p>
          <Link href="/upload" className="bg-[#D1B898] hover:bg-[#c2a47e] text-black px-8 py-3.5 font-bold rounded-sm inline-flex items-center gap-2">
            Upload First Book
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Featured Hero Book */}
        <section className="flex flex-col md:flex-row gap-16 items-center md:items-start justify-between mb-32">
          <div className="flex-1 space-y-6 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              {mainBook.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base font-medium text-text-dimmed">
              <span className="text-primary-500">By {mainBook.author}</span>
              {mainBook.categoryId && <span>Category <span className="text-white">{mainBook.categoryId}</span></span>}
              <span className="flex items-center gap-1">{mainBook.pages} pages</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm md:text-base text-text-dimmed pt-4 border-t border-border-dim/50">
              <span>Total Books in Library: <span className="text-white font-semibold">{allBooksCount}</span></span>
              <span>Status: <span className="text-white font-semibold">{mainBook.isAvailable ? "Available" : "Checked Out"}</span></span>
            </div>
            
            <p className="text-text-dimmed text-base md:text-lg leading-relaxed pt-2">
              {mainBook.summary?.length as number >= 300 ? mainBook?.summary?.slice(0, 300) + "..." : mainBook?.summary}
            </p>
            
            <div className="pt-6">
              <Link 
                href={`/book/${mainBook.id}`}
                className="inline-flex items-center justify-center gap-3 bg-[#D1B898] hover:bg-[#c2a47e] text-black px-8 py-3.5 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1 w-full md:w-auto"
              >
                <BookOpen className="w-5 h-5" />
                VER DETALHES
              </Link>
            </div>
          </div>
          
          <div className="relative group w-full max-w-[320px] md:max-w-[400px] aspect-[3/4] rounded-sm overflow-hidden border border-border-dim shadow-2xl shadow-primary-500/5 perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-base/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image 
              src={mainBook.coverUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop"} 
              alt={mainBook.title}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
            {/* Book spine effect mock */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 to-transparent z-20 pointer-events-none" />
          </div>
        </section>

        {/* Latest Books Grid */}
        {latestBooks.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-4">
              Latest Books
              <div className="flex-1 h-px bg-border-dim"></div>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {latestBooks.map((book: any) => (
                <Link href={`/book/${book.id}`} key={book.id} className="relative group aspect-[3/4] rounded-sm overflow-hidden border border-border-dim hover:border-primary-500/50 transition-all shadow-lg hover:shadow-primary-500/20 transform hover:-translate-y-2 block">
                  <Image 
                    src={book.coverUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=300&auto=format&fit=crop"} 
                    alt={book.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-4 gap-2">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">{book.title}</h3>
                    <p className="text-gray-400 font-semibold text-sm line-clamp-2 leading-tight">{book.author} {book.pages > 0 && `• ${book.pages} pages`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
