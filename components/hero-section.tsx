"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, LogIn } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Welcome to Techfuse DocControl Service
          </h1>
          <p className="mt-4 text-xl font-medium text-primary md:text-2xl">
            Your guided document automation portal
          </p>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            Follow the steps below to complete your application from start to finish.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
            <Link href="/client-signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 hover:text-background">
                <Mail className="mr-2 h-5 w-5" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
