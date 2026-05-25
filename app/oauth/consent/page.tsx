'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthConsentPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/client/dashboard'
      
      console.log('Callback received. Code:', code ? 'Present' : 'Missing')
      
      if (!code) {
        setError('No authorization code received')
        setLoading(false)
        return
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // Exchange code for session
      const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=${code}`
      console.log('Exchanging code at:', tokenUrl)
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'apikey': apiKey!,
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Token exchange failed:', response.status, errorText)
        throw new Error(`Token exchange failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Token exchange successful')
      
      // Store session
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000
      }))
      
      // Also store in sessionStorage for redundancy
      sessionStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }))
      
      // Redirect to dashboard
      router.push(next)
      
    } catch (err: any) {
      console.error('Callback error:', err)
      setError(err.message || 'Authentication failed')
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
