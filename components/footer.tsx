"use client"

import Image from "next/image"
import Link from "next/link"
import { ContactForm } from "./contact-form"

export function Footer() {
  return (
    <footer id="support" className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          <ContactForm />
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/techfuse-logo.svg"
                alt="Techfuse DocControl Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold text-foreground">Techfuse DocControl</span>
            </Link>
            <p className="text-sm text-muted-foreground">Your trusted document automation partner</p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Techfuse DocControl. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Terms and Conditions</span>
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
