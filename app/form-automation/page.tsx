import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProcessSteps } from "@/components/process-steps"
import { MarqueeBanner } from "@/components/marquee-banner"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <MarqueeBanner />
        <HeroSection />
        <ProcessSteps />
      </main>
      <Footer />
    </div>
  )
}
