import { BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-dim/50 bg-surface-base mt-auto">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 text-text-dimmed">
            <BookOpen className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-white tracking-tight">Libwise</span>
            <span className="text-sm">— Sua biblioteca digital aberta.</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-text-dimmed">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/upload" className="hover:text-white transition-colors">Upload</Link>
            <a
              href="https://github.com/kaiowsz/libwise_"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border-dim/30 text-center text-xs text-text-dimmed/60">
          Built with Next.js & Cloudflare R2 · {new Date().getFullYear()} Libwise
        </div>
      </div>
    </footer>
  );
}
