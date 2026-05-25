'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FormsIndexPage() {
  const router = useRouter()
  const supabase = createClient()
  const [completedForms, setCompletedForms] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkProgress()
  }, [])

  async function checkProgress() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('last_completed_form')
      .eq('id', user.id)
      .single()

    const completed = []
    for (let i = 2; i <= (profile?.last_completed_form || 1); i++) {
      completed.push(i)
    }
    setCompletedForms(completed)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Forms 02-17</h1>
      <p className="text-gray-600 mb-6">Complete each form in order. Forms will auto-populate with your Form-01 data.</p>
      
      <div className="space-y-3">
        {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map((num) => {
          const isCompleted = completedForms.includes(num)
          const isNextEnabled = num === 2 || completedForms.includes(num - 1)
          
          return (
            <div key={num} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <span className="font-medium">Form-{num.toString().padStart(2, '0')}</span>
                {isCompleted && <span className="ml-2 text-green-600 text-sm">✓ Completed</span>}
              </div>
              <button
                onClick={() => router.push(`/client/forms/${num}`)}
                disabled={!isNextEnabled && !isCompleted}
                className={`px-4 py-1 rounded ${isNextEnabled || isCompleted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isCompleted ? 'Review' : 'Start'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
