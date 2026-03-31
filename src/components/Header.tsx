import { BookOpen } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import MobileSearch from "./MobileSearch";
import AuthButtons from "./AuthButtons";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-base/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-text-main hover:text-white transition-colors">
          <BookOpen className="w-6 h-6 text-primary-500" />
          <span className="font-bold text-lg tracking-tight">Libwise</span>
        </Link>
        
        {/* Search (desktop) */}
        <SearchBar />

        {/* Mobile Search + Auth */}
        <div className="flex items-center gap-2">
          <MobileSearch />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
