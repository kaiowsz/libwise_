"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtons() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/upload" className="text-sm font-medium text-text-dimmed hover:text-white transition-colors">
          Upload Book
        </Link>
        <UserButton />
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="px-4 py-2 text-sm font-medium bg-surface-elevated text-text-main border border-border-dim rounded-md hover:bg-surface-raised hover:border-border-glow transition-all cursor-pointer">
        Sign In
      </button>
    </SignInButton>
  );
}
