'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ClientFormPage() {
  const params = useParams()
  const formNumber = parseInt(params.formNumber as string)
  const [filledHtml, setFilledHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchFormAndPopulate()
  }, [formNumber])

  async function fetchFormAndPopulate() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: existing } = await supabase
      .from('generated_forms')
      .select('filled_html')
      .eq('user_id', user.id)
      .eq('form_number', formNumber)
      .single()

    if (existing) {
      setFilledHtml(existing.filled_html)
      setLoading(false)
      return
    }

    const { data: template } = await supabase
      .from('form_templates')
      .select('template_html')
      .eq('form_number', formNumber)
      .single()

    if (!template) {
      setFilledHtml('<p>Form template not found</p>')
      setLoading(false)
      return
    }

    const { data: formData } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let html = template.template_html
    const matches = html.match(/{{(.*?)}}/g)
    
    if (matches) {
      matches.forEach(match => {
        const key = match.replace(/{{/g, '').replace(/}}/g, '').trim()
        const value = formData ? (formData[key] || '') : ''
        html = html.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
      })
    }
    
    html = html.replace(/{{current_date}}/g, new Date().toLocaleDateString())
    html = html.replace(/{{current_day}}/g, new Date().getDate().toString())
    html = html.replace(/{{current_month}}/g, new Date().toLocaleString('default', { month: 'long' }))
    html = html.replace(/{{current_year}}/g, new Date().getFullYear().toString())

    // Remove any baby picture placeholders
    html = html.replace(/{{profile_picture}}/g, '')
    html = html.replace(/{{baby_picture}}/g, '')
    html = html.replace(/\[Baby Photo\]/g, '')

    await supabase.from('generated_forms').insert({
      user_id: user.id,
      user_email: user.email,
      form_number: formNumber,
      filled_html: html,
      is_locked: false,
      is_submitted: false
    })

    setFilledHtml(html)
    setLoading(false)
  }

  async function handleComplete() {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('user_roles')
      .update({ onboarding_complete: true })
      .eq('user_id', user.id)

    setSaving(false)

    if (formNumber < 16) {
      router.push(`/client/forms/${formNumber + 1}`)
    } else {
      router.push('/client/forms/complete')
    }
  }

  function handlePrevious() {
    if (formNumber > 2) {
      router.push(`/client/forms/${formNumber - 1}`)
    } else if (formNumber === 2) {
      router.push('/client/form-01')
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading form...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b mb-6">
        <div className="flex justify-between items-center">
          <Link href="/client/form-01" className="text-blue-600 hover:text-blue-800">
            ← Form-01
          </Link>
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Complete & Continue →'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Form-{formNumber.toString().padStart(2, '0')}</h1>
        <div className="text-sm text-gray-500 mt-1">Form {formNumber} of 16</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((formNumber - 2) / 14) * 100}%` }} />
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
        <div dangerouslySetInnerHTML={{ __html: filledHtml }} />
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleComplete}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Complete & Continue →'}
        </button>
      </div>
    </div>
  )
}
