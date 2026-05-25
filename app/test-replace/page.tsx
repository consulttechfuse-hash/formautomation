'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestReplace() {
  const [result, setResult] = useState('')
  const supabase = createClient()

  useEffect(() => {
    testReplacement()
  }, [])

  async function testReplacement() {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get form data
    const { data: formData } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user?.id)
      .single()

    // Sample template
    const template = `
      <p>Full Name: {{fln_t1}}</p>
      <p>Gender: {{gen_t1}}</p>
      <p>Witness 1: {{wtn1_t1}} ({{wtn1_t3}})</p>
      <p>Witness 2: {{wtn2_t1}} ({{wtn2_t3}})</p>
    `

    let html = template
    
    // Replace placeholders
    const matches = template.match(/{{(.*?)}}/g)
    if (matches) {
      matches.forEach(match => {
        const key = match.replace(/{{/g, '').replace(/}}/g, '').trim()
        const value = formData ? (formData[key] || `[MISSING: ${key}]`) : '[NO DATA]'
        html = html.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
      })
    }

    setResult(`
      Form Data from DB: ${JSON.stringify(formData, null, 2)}
      
      ---
      
      Rendered HTML: ${html}
    `)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Placeholder Test</h1>
      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  )
}
