"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <span className={cn("text-xl font-bold tracking-tight")}>Home</span>
          </Link>
          <nav className="space-x-4 text-sm font-medium">
            <Link
              href="/main"
              className="text-muted-foreground hover:text-foreground"
            >
              Playground
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground"
            >
              Save Prompt
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
