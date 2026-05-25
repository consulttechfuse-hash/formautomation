'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Form01Page() {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [showJumpMenu, setShowJumpMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [middleNameCount, setMiddleNameCount] = useState(1)
  const [marriedSurnameCount, setMarriedSurnameCount] = useState(1)
  const [childCount, setChildCount] = useState(1)

  const noticeOfficeSamples = {
    pno_t1: `OFFICE OF MASTER\nMaster of the High Court Gauteng SALU Building\n316 Thabo Sehume St Pretoria\n(0001)`,
    pno_t2: `OFFICE OF THE MINISTER OF HOME AFFAIRS\nPrivate Bag X114\nPretoria\nGauteng\n(0001)`,
    pno_t3: `OFFICE OF SARS COMMISSIONER\nPrivate Bag X923\nPretoria\n(0001)`,
    pno_t4: `OFFICE OF THE MINISTER OF FINANCE\nPrivate Bag X115\nPretoria\n(0001)`
  }

  const countriesList = [
    "South Africa", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ]

  useEffect(() => {
    loadData()
  }, [])

  function calculateAutoCompleteFields(currentData: Record<string, any>): Record<string, any> {
    const updates: Record<string, any> = {}

    const firstName = currentData.fn_t1 || ''
    const middleName = currentData.mdn_t1 || ''
    const surname = currentData.srn_t1 || ''
    const birthDay = currentData.bdate_t1 || ''
    const birthMonth = currentData.bdate_t2 || ''
    const birthYear = currentData.bdate_t3 || ''

    updates.fln_t1 = `${firstName} ${middleName} ${surname}`.trim().replace(/\s+/g, ' ')
    updates.fln_t2 = updates.fln_t1.toUpperCase()
    updates.fln_t3 = updates.fln_t1.toLowerCase()
    updates.fln_t4 = `${firstName} ${surname}`.trim()
    
    const firstInitial = firstName.charAt(0)
    updates.fln_t5 = `${firstName} ${firstInitial} ${middleName} ${surname}`.trim().replace(/\s+/g, ' ')
    
    updates.fn_t2 = firstName.toUpperCase()
    updates.fn_t3 = firstName.toLowerCase()
    updates.fni_t1 = firstName.charAt(0).toLowerCase()
    updates.fni_t2 = firstName.charAt(0).toUpperCase()
    
    updates.srn_t2 = surname.toUpperCase()
    updates.srn_t3 = surname.toLowerCase()
    updates.srni_t1 = surname.charAt(0).toLowerCase()
    updates.srni_t2 = surname.charAt(0).toUpperCase()
    
    updates.mdn_t2 = middleName.toUpperCase()
    updates.mdn_t3 = middleName.toLowerCase()
    updates.mdni_t1 = middleName.charAt(0).toLowerCase()
    updates.mdni2_t2 = middleName.charAt(0).toUpperCase()
    
    if (birthDay && birthMonth && birthYear) {
      const day = birthDay.padStart(2, '0')
      const month = birthMonth.padStart(2, '0')
      
      updates.dis_t1 = `${day}/${month}/${birthYear}`
      updates.dis_t2 = `${day}-${month}-${birthYear}`
      updates.dis_t3 = `${day} ${month},${birthYear}`
      updates.dtn_t1 = `${month}/${day}/${birthYear}`
      updates.dtn_t2 = `${month}-${day}-${birthYear}`
      updates.dtn_t3 = `${month} ${day},${birthYear}`
      
      const year21 = (parseInt(birthYear) + 21).toString()
      updates['21st_t3'] = year21
      updates['21st_t4'] = `${day} ${month}, ${year21}`
    }

    return updates
  }

  async function loadData() {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: existingData } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const initialData: Record<string, any> = {}

    initialData.fn_t1 = existingData?.fn_t1 || ''
    initialData.mdn_t1 = existingData?.mdn_t1 || ''
    initialData.srn_t1 = existingData?.srn_t1 || ''
    initialData.bsrn_t1 = existingData?.bsrn_t1 || ''
    initialData.mr1_t1 = existingData?.mr1_t1 || ''
    initialData.no_middle_name = existingData?.no_middle_name || 'No'
    initialData.bsrn_not_applicable = existingData?.bsrn_not_applicable || 'No'
    initialData.mr_not_married = existingData?.mr_not_married || 'No'

    for (let i = 2; i <= 5; i++) {
      initialData[`mdn${i}_t1`] = existingData?.[`mdn${i}_t1`] || ''
      if (initialData[`mdn${i}_t1`]) setMiddleNameCount(i)
    }

    for (let i = 2; i <= 5; i++) {
      initialData[`mr${i}_t1`] = existingData?.[`mr${i}_t1`] || ''
      if (initialData[`mr${i}_t1`]) setMarriedSurnameCount(i)
    }

    initialData.ema_t1 = existingData?.ema_t1 || ''
    initialData.cnt_1 = existingData?.cnt_1 || ''

    initialData.pffn_t1 = existingData?.pffn_t1 || ''
    initialData.pmfn_t1 = existingData?.pmfn_t1 || ''
    initialData.pmfn_t3_1 = existingData?.pmfn_t3_1 || ''
    initialData.pfbt_t2 = existingData?.pfbt_t2 || ''
    initialData.pfbt_t3_1 = existingData?.pfbt_t3_1 || ''
    initialData.pfbt_t4 = existingData?.pfbt_t4 || ''
    initialData.pmbd_t2 = existingData?.pmbd_t2 || ''
    initialData.pmbd_t3 = existingData?.pmbd_t3 || ''
    initialData.pmbd_t4 = existingData?.pmbd_t4 || ''

    initialData.strn_t1 = existingData?.strn_t1 || ''
    initialData.sbn_t1 = existingData?.sbn_t1 || ''
    initialData.aptn_t1 = existingData?.aptn_t1 || ''
    initialData.ctn_t1 = existingData?.ctn_t1 || ''
    initialData.dstr_t1 = existingData?.dstr_t1 || ''
    initialData.spn_t1 = existingData?.spn_t1 || ''
    initialData.ctr_t1 = existingData?.ctr_t1 || 'South Africa'
    initialData.ptc_t1 = existingData?.ptc_t1 || ''
    initialData.no_apartment = existingData?.no_apartment || 'No'

    initialData.gen_t1 = existingData?.gen_t1 || ''
    initialData.she_t1 = existingData?.she_t1 || ''
    initialData.bgr_t1 = existingData?.bgr_t1 || ''
    initialData.his_t1 = existingData?.his_t1 || ''

    initialData.bdate_t1 = existingData?.bdate_t1 || ''
    initialData.bdate_t2 = existingData?.bdate_t2 || ''
    initialData.bdate_t3 = existingData?.bdate_t3 || ''

    initialData.pno_t1 = existingData?.pno_t1 || noticeOfficeSamples.pno_t1
    initialData.pno_t2 = existingData?.pno_t2 || noticeOfficeSamples.pno_t2
    initialData.pno_t3 = existingData?.pno_t3 || noticeOfficeSamples.pno_t3
    initialData.pno_t4 = existingData?.pno_t4 || noticeOfficeSamples.pno_t4

    let maxChild = 1
    for (let i = 1; i <= 20; i++) {
      initialData[`chld${i}_t1`] = existingData?.[`chld${i}_t1`] || ''
      initialData[`chld${i}_id`] = existingData?.[`chld${i}_id`] || ''
      if (initialData[`chld${i}_t1`]) maxChild = i
    }
    setChildCount(maxChild)

    for (let w = 1; w <= 3; w++) {
      initialData[`wtn${w}_t1`] = existingData?.[`wtn${w}_t1`] || ''
      initialData[`wtn${w}_t2`] = existingData?.[`wtn${w}_t2`] || ''
      initialData[`wtn${w}_t3`] = existingData?.[`wtn${w}_t3`] || ''
      initialData[`wtn${w}_t4`] = existingData?.[`wtn${w}_t4`] || ''
      initialData[`wtn${w}_t5`] = existingData?.[`wtn${w}_t5`] || 'South Africa'
      initialData[`wtn${w}_t6`] = existingData?.[`wtn${w}_t6`] || ''
    }

    const autoComplete = calculateAutoCompleteFields(initialData)
    Object.assign(initialData, autoComplete)

    setFormData(initialData)
    setLoading(false)
  }

  async function saveToDatabase() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('User not found')
      return false
    }

    const dataToSave: Record<string, any> = {
      user_id: user.id,
      user_email: user.email,
      updated_at: new Date().toISOString()
    }

    for (const [key, value] of Object.entries(formData)) {
      if (value !== undefined && value !== null && value !== '') {
        dataToSave[key] = value
      }
    }

    setSaveStatus('Saving...')

    const { data: existing } = await supabase
      .from('form01_data')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let result
    if (existing) {
      result = await supabase
        .from('form01_data')
        .update(dataToSave)
        .eq('user_id', user.id)
    } else {
      dataToSave.created_at = new Date().toISOString()
      result = await supabase
        .from('form01_data')
        .insert(dataToSave)
    }

    if (result.error) {
      console.error('Save error:', result.error)
      setError(`Save failed: ${result.error.message}`)
      setSaveStatus('Save failed!')
      return false
    }

    setSaveStatus('Saved!')
    setTimeout(() => setSaveStatus(''), 2000)
    return true
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      const autoComplete = calculateAutoCompleteFields(newData)
      Object.assign(newData, autoComplete)
      return newData
    })
    setError(null)
  }

  function handleCheckboxChange(field: string, checked: boolean) {
    const value = checked ? 'Yes' : 'No'
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'no_middle_name' && checked) {
      for (let i = 2; i <= 5; i++) {
        setFormData(prev => ({ ...prev, [`mdn${i}_t1`]: '' }))
      }
    }
    
    if (field === 'no_apartment' && checked) {
      setFormData(prev => ({ ...prev, aptn_t1: '' }))
    }
  }

  function addMiddleName() {
    if (middleNameCount < 5) {
      setMiddleNameCount(middleNameCount + 1)
    }
  }

  function addMarriedSurname() {
    if (marriedSurnameCount < 5) {
      setMarriedSurnameCount(marriedSurnameCount + 1)
    }
  }

  function addChild() {
    if (childCount < 20) {
      setChildCount(childCount + 1)
    }
  }

  function capitalizeWords(str: string): string {
    if (!str) return str
    return str.split(' ').map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
  }

  function formatPhone(value: string): string {
    if (!value) return value
    let digits = value.replace(/\D/g, '')
    if (!value.startsWith('+')) {
      if (digits.startsWith('27')) return '+' + digits
      if (digits.startsWith('0')) return '+27' + digits.substring(1)
      return '+' + digits
    }
    return value
  }

  function validateYear(value: string): string {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length > 4) return digits.slice(0, 4)
    return digits
  }

  async function handleContinue() {
    setSaving(true)
    const success = await saveToDatabase()
    setSaving(false)
    if (success) {
      router.push('/forms/02')
    }
  }

  const jumpToForm = (formNumber: number) => {
    router.push(`/forms/${String(formNumber).padStart(2, '0')}`)
    setShowJumpMenu(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Form-01: National Information</h1>
          <div className="flex items-center gap-4">
            {saveStatus && <span className="text-sm text-gray-500">{saveStatus}</span>}
            <button 
              onClick={handleContinue} 
              disabled={saving} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
        
        {/* Separator Line */}
        <hr className="my-4 border-gray-300" />
        
        {/* Jump Link Button */}
        <div className="flex justify-end">
          <div className="relative">
            <button
              onClick={() => setShowJumpMenu(!showJumpMenu)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
            >
              Jump to Form ▼
            </button>
            {showJumpMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(num => (
                  <button
                    key={num}
                    onClick={() => jumpToForm(num)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Form {String(num).padStart(2, '0')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* N1.1 - NAMES */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.1 - National Naming Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">First Name</label>
            <input
              type="text"
              value={formData['fn_t1'] || ''}
              onChange={(e) => handleChange('fn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Middle Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData['mdn_t1'] || ''}
                onChange={(e) => handleChange('mdn_t1', capitalizeWords(e.target.value))}
                className="flex-1 border rounded-lg p-2"
                disabled={formData['no_middle_name'] === 'Yes'}
              />
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={formData['no_middle_name'] === 'Yes'}
                  onChange={(e) => handleCheckboxChange('no_middle_name', e.target.checked)}
                />
                No Middle Name
              </label>
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Surname</label>
            <input
              type="text"
              value={formData['srn_t1'] || ''}
              onChange={(e) => handleChange('srn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        {formData['no_middle_name'] !== 'Yes' && (
          <div className="mt-4">
            {[...Array(middleNameCount - 1)].map((_, idx) => (
              <div key={idx + 2} className="mt-2">
                <label className="block font-medium mb-1">Middle Name {idx + 2}</label>
                <input
                  type="text"
                  value={formData[`mdn${idx + 2}_t1`] || ''}
                  onChange={(e) => handleChange(`mdn${idx + 2}_t1`, capitalizeWords(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            ))}
            {middleNameCount < 5 && (
              <button type="button" onClick={addMiddleName} className="mt-2 text-blue-600 text-sm">
                + Add Another Middle Name
              </button>
            )}
          </div>
        )}

        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer">Auto-complete Name Formats</summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
            <p><strong>Full Name (Normal):</strong> {formData['fln_t1'] || '-'}</p>
            <p><strong>Full Name (Uppercase):</strong> {formData['fln_t2'] || '-'}</p>
            <p><strong>First Name Uppercase:</strong> {formData['fn_t2'] || '-'}</p>
            <p><strong>Surname Uppercase:</strong> {formData['srn_t2'] || '-'}</p>
          </div>
        </details>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Surname at Birth</label>
            <input
              type="text"
              value={formData['bsrn_t1'] || ''}
              onChange={(e) => handleChange('bsrn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
              disabled={formData['bsrn_not_applicable'] === 'Yes'}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={formData['bsrn_not_applicable'] === 'Yes'}
                onChange={(e) => handleCheckboxChange('bsrn_not_applicable', e.target.checked)}
              />
              Not Applicable
            </label>
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Current Married Surname</label>
              <input
                type="text"
                value={formData['mr1_t1'] || ''}
                onChange={(e) => handleChange('mr1_t1', capitalizeWords(e.target.value))}
                className="w-full border rounded-lg p-2"
                disabled={formData['mr_not_married'] === 'Yes'}
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData['mr_not_married'] === 'Yes'}
                  onChange={(e) => handleCheckboxChange('mr_not_married', e.target.checked)}
                />
                Never Married
              </label>
            </div>
          </div>

          {formData['mr_not_married'] !== 'Yes' && (
            <div className="mt-2">
              {[...Array(marriedSurnameCount - 1)].map((_, idx) => (
                <div key={idx + 2} className="mt-2">
                  <label className="block font-medium mb-1">Previous Married Surname {idx + 2}</label>
                  <input
                    type="text"
                    value={formData[`mr${idx + 2}_t1`] || ''}
                    onChange={(e) => handleChange(`mr${idx + 2}_t1`, capitalizeWords(e.target.value))}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              ))}
              {marriedSurnameCount < 5 && (
                <button type="button" onClick={addMarriedSurname} className="mt-2 text-blue-600 text-sm">
                  + Add Previous Married Surname
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* N1.3 - CONTACTS */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.3 - National Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formData['ema_t1'] || ''}
              onChange={(e) => handleChange('ema_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              value={formData['cnt_1'] || ''}
              onChange={(e) => handleChange('cnt_1', formatPhone(e.target.value))}
              className="w-full border rounded-lg p-2"
              placeholder="+27 82 555 1234"
            />
          </div>
        </div>
      </div>

      {/* N1.4 - PARENTS */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.4 - Parents Information</h2>
        
        <h3 className="font-semibold mb-2">Father's Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Father's Full Name</label>
            <input
              type="text"
              value={formData['pffn_t1'] || ''}
              onChange={(e) => handleChange('pffn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Father's Birth Day</label>
            <select
              value={formData['pfbt_t2'] || ''}
              onChange={(e) => handleChange('pfbt_t2', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Father's Birth Month</label>
            <select
              value={formData['pfbt_t3_1'] || ''}
              onChange={(e) => handleChange('pfbt_t3_1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Month</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Father's Birth Year</label>
            <input
              type="text"
              value={formData['pfbt_t4'] || ''}
              onChange={(e) => handleChange('pfbt_t4', validateYear(e.target.value))}
              className="w-full border rounded-lg p-2"
              placeholder="YYYY"
            />
          </div>
        </div>

        <h3 className="font-semibold mb-2">Mother's Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Mother's Full Name</label>
            <input
              type="text"
              value={formData['pmfn_t1'] || ''}
              onChange={(e) => handleChange('pmfn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Mother's Maiden Surname</label>
            <input
              type="text"
              value={formData['pmfn_t3_1'] || ''}
              onChange={(e) => handleChange('pmfn_t3_1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Mother's Birth Day</label>
            <select
              value={formData['pmbd_t2'] || ''}
              onChange={(e) => handleChange('pmbd_t2', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Mother's Birth Month</label>
            <select
              value={formData['pmbd_t3'] || ''}
              onChange={(e) => handleChange('pmbd_t3', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Month</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Mother's Birth Year</label>
            <input
              type="text"
              value={formData['pmbd_t4'] || ''}
              onChange={(e) => handleChange('pmbd_t4', validateYear(e.target.value))}
              className="w-full border rounded-lg p-2"
              placeholder="YYYY"
            />
          </div>
        </div>
      </div>

      {/* N1.5 - ADDRESSES */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.5 - National Addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Street Name</label>
            <input
              type="text"
              value={formData['strn_t1'] || ''}
              onChange={(e) => handleChange('strn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Suburb Name</label>
            <input
              type="text"
              value={formData['sbn_t1'] || ''}
              onChange={(e) => handleChange('sbn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Apartment Name</label>
              <input
                type="text"
                value={formData['aptn_t1'] || ''}
                onChange={(e) => handleChange('aptn_t1', capitalizeWords(e.target.value))}
                className="w-full border rounded-lg p-2"
                disabled={formData['no_apartment'] === 'Yes'}
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData['no_apartment'] === 'Yes'}
                  onChange={(e) => handleCheckboxChange('no_apartment', e.target.checked)}
                />
                No Apartment
              </label>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">City/Town</label>
            <input
              type="text"
              value={formData['ctn_t1'] || ''}
              onChange={(e) => handleChange('ctn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">District</label>
            <input
              type="text"
              value={formData['dstr_t1'] || ''}
              onChange={(e) => handleChange('dstr_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Province/State</label>
            <input
              type="text"
              value={formData['spn_t1'] || ''}
              onChange={(e) => handleChange('spn_t1', capitalizeWords(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Country</label>
            <select
              value={formData['ctr_t1'] || 'South Africa'}
              onChange={(e) => handleChange('ctr_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {countriesList.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Postal Code</label>
            <input
              type="text"
              value={formData['ptc_t1'] || ''}
              onChange={(e) => handleChange('ptc_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* N1.6 - GENDERS */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.6 - National Genders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Gender (woman/man)</label>
            <select
              value={formData['gen_t1'] || ''}
              onChange={(e) => handleChange('gen_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="woman">woman</option>
              <option value="man">man</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Pronoun (he/she)</label>
            <select
              value={formData['she_t1'] || ''}
              onChange={(e) => handleChange('she_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="she">she</option>
              <option value="he">he</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Reference (girl/boy)</label>
            <select
              value={formData['bgr_t1'] || ''}
              onChange={(e) => handleChange('bgr_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="girl">girl</option>
              <option value="boy">boy</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Possessive (hers/his)</label>
            <select
              value={formData['his_t1'] || ''}
              onChange={(e) => handleChange('his_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="hers">hers</option>
              <option value="his">his</option>
            </select>
          </div>
        </div>
      </div>

      {/* N1.7 - DATES */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.7 - National Dates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Birth Day</label>
            <select
              value={formData['bdate_t1'] || ''}
              onChange={(e) => handleChange('bdate_t1', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Birth Month</label>
            <select
              value={formData['bdate_t2'] || ''}
              onChange={(e) => handleChange('bdate_t2', e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Month</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Birth Year</label>
            <input
              type="text"
              value={formData['bdate_t3'] || ''}
              onChange={(e) => handleChange('bdate_t3', validateYear(e.target.value))}
              className="w-full border rounded-lg p-2"
              placeholder="YYYY"
            />
          </div>
        </div>
        
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer">Auto-complete Date Formats</summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
            <p><strong>ISO (dd/mm/yyyy):</strong> {formData['dis_t1'] || '-'}</p>
            <p><strong>ANSI (mm/dd/yyyy):</strong> {formData['dtn_t1'] || '-'}</p>
            <p><strong>21st Birthday Year:</strong> {formData['21st_t3'] || '-'}</p>
          </div>
        </details>
      </div>

      {/* CHILDREN */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Children</h2>
        {[...Array(childCount)].map((_, idx) => (
          <div key={idx + 1} className="mb-4 p-3 border rounded-lg">
            <h3 className="font-semibold mb-2">Child {idx + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData[`chld${idx + 1}_t1`] || ''}
                  onChange={(e) => handleChange(`chld${idx + 1}_t1`, capitalizeWords(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">ID/Passport Number</label>
                <input
                  type="text"
                  value={formData[`chld${idx + 1}_id`] || ''}
                  onChange={(e) => handleChange(`chld${idx + 1}_id`, e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
        {childCount < 20 && (
          <button type="button" onClick={addChild} className="text-blue-600 text-sm">
            + Add Another Child
          </button>
        )}
      </div>

      {/* N1.8 - WITNESSES */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.8 - National Witnesses</h2>
        {[1, 2, 3].map((w) => (
          <div key={w} className="mb-6 p-3 border rounded-lg">
            <h3 className="font-semibold mb-3">Witness {w}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData[`wtn${w}_t1`] || ''}
                  onChange={(e) => handleChange(`wtn${w}_t1`, capitalizeWords(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Full Address</label>
                <input
                  type="text"
                  value={formData[`wtn${w}_t2`] || ''}
                  onChange={(e) => handleChange(`wtn${w}_t2`, capitalizeWords(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData[`wtn${w}_t3`] || ''}
                  onChange={(e) => handleChange(`wtn${w}_t3`, e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData[`wtn${w}_t4`] || ''}
                  onChange={(e) => handleChange(`wtn${w}_t4`, formatPhone(e.target.value))}
                  className="w-full border rounded-lg p-2"
                  placeholder="+27 82 555 1234"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Country</label>
                <select
                  value={formData[`wtn${w}_t5`] || 'South Africa'}
                  onChange={(e) => handleChange(`wtn${w}_t5`, e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {countriesList.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">How do you know the applicant?</label>
                <input
                  type="text"
                  value={formData[`wtn${w}_t6`] || ''}
                  onChange={(e) => handleChange(`wtn${w}_t6`, e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* N1.9 - PRINCIPAL NOTICE OFFICES */}
      <div className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">N1.9 - Principal Notice Offices</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-medium mb-1">Office of Master</label>
            <textarea
              value={formData['pno_t1'] || noticeOfficeSamples.pno_t1}
              onChange={(e) => handleChange('pno_t1', e.target.value)}
              className="w-full border rounded-lg p-2 font-mono text-sm"
              rows={4}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Office of the Minister of Home Affairs</label>
            <textarea
              value={formData['pno_t2'] || noticeOfficeSamples.pno_t2}
              onChange={(e) => handleChange('pno_t2', e.target.value)}
              className="w-full border rounded-lg p-2 font-mono text-sm"
              rows={5}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Office of SARS Commissioner</label>
            <textarea
              value={formData['pno_t3'] || noticeOfficeSamples.pno_t3}
              onChange={(e) => handleChange('pno_t3', e.target.value)}
              className="w-full border rounded-lg p-2 font-mono text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Office of the Minister of Finance</label>
            <textarea
              value={formData['pno_t4'] || noticeOfficeSamples.pno_t4}
              onChange={(e) => handleChange('pno_t4', e.target.value)}
              className="w-full border rounded-lg p-2 font-mono text-sm"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleContinue} 
          disabled={saving} 
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Continue →'}
        </button>
      </div>
    </div>
  )
}
