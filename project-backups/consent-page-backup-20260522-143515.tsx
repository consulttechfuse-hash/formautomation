'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [consentHtml, setConsentHtml] = useState('')
  const [formData, setFormData] = useState({
    full_names: '',
    id_passport: '',
    address: '',
    email: '',
    mobile: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadConsentHtml()
  }, [])

  const loadConsentHtml = async () => {
    const { data, error } = await supabase
      .from('consents')
      .select('html_content')
      .eq('cont_key', 'consent')
      .single()

    if (data?.html_content) {
      setConsentHtml(data.html_content)
    } else {
      console.error('Error loading consent:', error)
    }
  }

  const capitalizeFirst = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'full_names') {
      formattedValue = capitalizeFirst(value)
    }
    if (name === 'id_passport') {
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    }
    if (name === 'address') {
      formattedValue = capitalizeFirst(value)
    }
    if (name === 'mobile') {
      let cleaned = value.replace(/[^\d+]/g, '')
      if (cleaned && !cleaned.startsWith('+')) {
        cleaned = '+' + cleaned
      }
      formattedValue = cleaned
    }
    if (name === 'email') {
      formattedValue = value.toLowerCase()
    }

    setFormData({ ...formData, [name]: formattedValue })
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  async function handleAccept() {
    if (!agreed) {
      alert('Please accept the terms')
      return
    }

    if (!formData.full_names) {
      alert('Please enter your Full Names')
      return
    }
    if (!formData.id_passport) {
      alert('Please enter your ID / Passport Number')
      return
    }
    if (!formData.address) {
      alert('Please enter your Address')
      return
    }
    if (!formData.email) {
      alert('Please enter your Email')
      return
    }
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address (name@domain.com)')
      return
    }
    if (!formData.mobile) {
      alert('Please enter your Mobile number')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const consentHtmlWithData = `
      <h3>Consent Form - ${formData.full_names}</h3>
      <p><strong>ID/Passport:</strong> ${formData.id_passport}</p>
      <p><strong>Address:</strong> ${formData.address}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Mobile:</strong> ${formData.mobile}</p>
      <hr/>
      ${consentHtml}
    `

    const { error: saveError } = await supabase
      .from('generated_forms')
      .upsert({
        user_id: user.id,
        user_email: user.email,
        form_number: 0,
        filled_html: consentHtmlWithData,
        is_locked: true,
        is_submitted: true,
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,form_number'
      })

    if (saveError) {
      console.error('Error saving consent:', saveError)
      alert('Error saving consent. Please try again.')
      setLoading(false)
      return
    }

    await supabase.from('users').update({ has_consented: true }).eq('id', user.id)

    setLoading(false)
    router.push('/client/select-admin')
  }

  const handleBack = () => {
    router.push('/client/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Consent & Declaration</h1>

      <div className="border rounded-lg p-6 bg-gray-50 mb-6 h-96 overflow-y-auto text-sm">
        <div dangerouslySetInnerHTML={{ __html: consentHtml }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Full Names *</label>
          <input
            type="text"
            name="full_names"
            value={formData.full_names}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Capitalizes first letter of each word</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ID / Passport Number *</label>
          <input
            type="text"
            name="id_passport"
            value={formData.id_passport}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Uppercase letters and numbers only</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Capitalizes first letter</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Must be valid email format (name@domain.com)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mobile / Telephone *</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            placeholder="+27123456789"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Starts with +, numbers only</p>
        </div>
      </div>

      <label className="flex items-center gap-3 mb-6">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>This selection I am consenting and declare to all Terms and Conditions, Privacy Policy of Techfuse Consulting, Operating Service for Techfuse Holdings (Pty) Ltd.</span>
      </label>

      <div className="flex gap-4">
        <button 
          onClick={handleBack} 
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <button 
          onClick={handleAccept} 
          disabled={loading} 
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Accept & Continue →'}
        </button>
      </div>
    </div>
  )
}
