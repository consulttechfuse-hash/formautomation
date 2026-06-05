'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import JumpButton from '@/components/JumpButton'

export default function Form01Page() {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string>('')
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

  async function loadUserProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return {}

      // Fetch user data from user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('first_name, last_name, phone_number, email, address, id_number')
        .eq('user_id', user.id)
        .single()

      if (userRole) {
        return {
          fn_t1: userRole.first_name || '',
          srn_t1: userRole.last_name || '',
          cnt_1: userRole.phone_number || '',
          ema_t1: userRole.email || user.email || '',
          cadr_t1: userRole.address || '',
          idp_t1: userRole.id_number || '',
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
    }
    return {}
  }

  async function loadData() {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Load user profile data from user_roles (signup + consent)
    const userProfileData = await loadUserProfileData()

    // Load existing form data
    const { data: existingData } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const initialData: Record<string, any> = {}

    // FIRST: Populate with user profile data (auto-population from signup + consent)
    // Map user_roles fields to form01 fields
    initialData.fn_t1 = userProfileData.fn_t1 || existingData?.fn_t1 || ''
    initialData.srn_t1 = userProfileData.srn_t1 || existingData?.srn_t1 || ''
    initialData.cnt_1 = userProfileData.cnt_1 || existingData?.cnt_1 || ''
    initialData.ema_t1 = userProfileData.ema_t1 || existingData?.ema_t1 || ''
    initialData.cadr_t1 = userProfileData.cadr_t1 || existingData?.cadr_t1 || ''
    initialData.idp_t1 = userProfileData.idp_t1 || existingData?.idp_t1 || ''

    // THEN: Populate other fields from existing data
    initialData.mdn_t1 = existingData?.mdn_t1 || ''
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

    const { error: saveError } = await supabase
      .from('form01_data')
      .upsert(dataToSave, { onConflict: 'user_id' })

    if (saveError) {
      setError(saveError.message)
      return false
    }

    return true
  }

  // Rest of the component remains the same (render, handleChange, etc.)
  // ... (keeping the existing render logic)

