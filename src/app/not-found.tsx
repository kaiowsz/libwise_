import { BookOpen } from "lucide-react";
import Link from "next/link";

export default async function NotFound() {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Featured Hero Book */}
        <section className="flex flex-col md:flex-row gap-16 items-center md:items-start justify-between mb-32">
          <div className="flex-1 space-y-6 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              404 - Page Not Found
            </h1>
            
            <div className="flex items-center gap-8 text-sm md:text-base text-text-dimmed pt-4 border-t border-border-dim/50">
            </div>
            
            <p className="text-text-dimmed text-base md:text-lg leading-relaxed pt-2">
              The page you are looking for does not exist.
            </p>
            
            <div className="pt-6">
              <Link 
                href={`/`}
                className="inline-flex items-center justify-center gap-3 bg-[#D1B898] hover:bg-[#c2a47e] text-black px-8 py-3.5 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1 w-full md:w-auto"
              >
                <BookOpen className="w-5 h-5" />
                VOLTAR PARA HOME
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
