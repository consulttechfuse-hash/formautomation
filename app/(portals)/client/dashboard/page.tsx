'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function ClientDashboard() {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkProgress()
  }, [])

  async function checkProgress() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    setUserId(session.user.id)

    const { data: userData, error } = await supabase
      .from('users')
      .select('has_consented, has_paid, onboarding_complete, onboarding_submitted, onboarding_locked, submitted_at, last_completed_form, admin_id')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
    }

    if (userData?.submitted_at) {
      const submitted = new Date(userData.submitted_at);
      const now = new Date();
      const expiryDate = new Date(submitted);
      expiryDate.setDate(expiryDate.getDate() + 7);
      const remaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysRemaining(remaining);
    }

    setProgress(userData || {})
    setLoading(false)
  }

  async function handleSignOut() {
    // Sign out from Supabase (clears all sessions)
    await supabase.auth.signOut()
    // Redirect to homepage
    router.push('/')
  }

  const steps = [
    { id: 1, name: 'Sign up', path: null, completed: true },
    { id: 2, name: 'Sign in', path: null, completed: true },
    { id: 3, name: 'Consent & Declaration', path: '/client/consent', completed: progress?.has_consented === true },
    { id: 4, name: 'Choose Your National Admin', path: '/client/select-admin', completed: progress?.admin_id !== null },
    { id: 5, name: 'Make Payment', path: '/client/select-payment', completed: progress?.has_paid === true },
    { id: 6, name: 'Complete Form-01', path: '/client/form-01', completed: progress?.onboarding_complete === true },
    { id: 7, name: 'Form Check & Submit', path: '/forms/check-submit', completed: progress?.onboarding_submitted === true },
  ]

  const currentStep = steps.find(step => step.completed === false && step.path !== null)
  const isSubmitted = progress?.onboarding_submitted === true

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Deep Orange background and Sign Out button */}
      <div className="bg-primary text-primary-foreground p-4 mb-8 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Techfuse DocControl</h1>
          <p className="text-primary-foreground/80 mt-1">Follow the steps below to complete your application.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Submission Status Banner */}
      {isSubmitted && daysRemaining !== null && daysRemaining > 0 && (
        <div className="bg-foreground text-background p-4 mb-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div 
              onClick={() => router.push('/forms/check-submit')}
              className="cursor-pointer group flex-1 transition-all duration-200 hover:bg-background/10 rounded-lg p-2 -m-2"
            >
              <p className="text-background font-bold text-lg group-hover:text-white transition-colors">
                ✓ All Forms Completed and Ready for Download
              </p>
            </div>
            <div className="bg-primary rounded-lg px-6 py-3 text-center min-w-[140px] shadow-md">
              <p className="text-primary-foreground text-2xl font-bold">{daysRemaining}</p>
              <p className="text-primary-foreground/80 text-xs font-medium">DAYS LEFT</p>
            </div>
          </div>
        </div>
      )}

      {isSubmitted && daysRemaining !== null && daysRemaining <= 0 && (
        <div className="bg-red-900/20 border border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-red-500 font-bold text-lg">⚠️ Files Have Been Moved Offline</p>
              <p className="text-red-400 text-sm mt-1">Please contact support for assistance.</p>
            </div>
            <button 
              onClick={() => router.push('/forms/check-submit')}
              className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between border border-border rounded-lg p-4 bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {step.completed ? '✓' : step.id}
              </div>
              <span className={step.completed ? 'text-muted-foreground' : 'text-foreground font-medium'}>{step.name}</span>
            </div>
            {step.path && !step.completed && (
              <button 
                onClick={() => router.push(step.path!)} 
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/80 transition-colors text-sm font-medium"
              >
                Start
              </button>
            )}
            {step.completed && <span className="text-green-600 font-medium text-sm">✓ Completed</span>}
          </div>
        ))}
      </div>

      {currentStep && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary">
            <strong>Next step:</strong> {currentStep.name}
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Questions? Contact <a href="mailto:support@techfuseconsulting.online" className="text-primary hover:underline">support@techfuseconsulting.online</a>
      </div>
    </div>
  )
}
