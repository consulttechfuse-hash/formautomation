"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/techfuse-logo.svg"
            alt="Techfuse DocControl Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-lg font-semibold text-foreground">Techfuse DocControl</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#how-it-works" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </Link>
          <Link href="#support" className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
            Support
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="#how-it-works"
              className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="#support"
              className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
