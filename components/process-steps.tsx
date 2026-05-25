import { UserPlus, LogIn, FileCheck, Users, CreditCard, FileText, Camera, Files } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  { number: 1, title: "Sign up", description: "Create your account to get started", icon: UserPlus },
  { number: 2, title: "Sign in", description: "Log in securely to your portal", icon: LogIn },
  { number: 3, title: "Consent & Declaration", description: "Read and accept the consent form", icon: FileCheck },
  { number: 4, title: "Choose Your National Admin", description: "Pick the admin who will oversee your case", icon: Users },
  { number: 5, title: "Make Payment", description: "Securely pay the one-off processing fee", icon: CreditCard },
  { number: 6, title: "Complete Form-01", description: "Fill in Form-01 fully and save/submit", icon: FileText },
  { number: 7, title: "Upload Your Picture", description: "Upload your profile/identity photo", icon: Camera },
  { number: 8, title: "Forms 02-17", description: 'Click "Start", forms complete automatically', icon: Files },
]

export function ProcessSteps() {
  return (
    <section id="how-it-works" className="bg-secondary py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Complete your application in 8 simple steps</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.number} className={`group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
              step.number % 2 === 1 ? "bg-[#C0C0C0]" : "bg-foreground"
            }`}>
              <div className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step.number % 2 === 1 ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
              }`}>
                {step.number}
              </div>
              <CardHeader className="pb-2">
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  step.number % 2 === 1 
                    ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground" 
                    : "bg-background/20 text-background group-hover:bg-background group-hover:text-foreground"
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <CardTitle className={`text-lg ${step.number % 2 === 0 ? "text-background" : ""}`}>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={`text-sm ${step.number % 2 === 0 ? "text-background/70" : ""}`}>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
