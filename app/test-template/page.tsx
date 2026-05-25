'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestTemplate() {
  const [template, setTemplate] = useState('Loading...')
  const supabase = createClient()

  useEffect(() => {
    loadTemplate()
  }, [])

  async function loadTemplate() {
    const { data, error } = await supabase
      .from('form_templates')
      .select('template_html')
      .eq('form_number', 2)
      .single()
    
    if (error) {
      setTemplate(`Error: ${error.message}`)
    } else {
      setTemplate(data?.template_html || 'Template not found')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Form-02 Template</h1>
      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto whitespace-pre-wrap">
        {template}
      </pre>
    </div>
  )
}
