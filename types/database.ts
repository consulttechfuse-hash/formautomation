export type Profile = {
  id: string
  email: string
  role: 'owner' | 'admin' | 'agent' | 'client'
  admin_id: string | null
  has_paid: boolean
  has_consented: boolean
  consented_at: string | null
  onboarding_complete: boolean
  onboarding_submitted: boolean
  last_completed_form: number
  picture_url: string | null
  created_at: string
}

export type Form01FieldConfig = {
  dev_name: string
  label: string
  field_type: 'text' | 'email' | 'tel' | 'dropdown'
  section: string
  is_visible: boolean
  is_required: boolean
  validation_rules: any
  dropdown_options: string[] | null
  display_order: number
}

export type Form01Data = {
  id: string
  user_id: string
  dev_name: string
  value: string
  created_at: string
}

export type FormTemplate = {
  form_number: number
  title: string
  template_html: string
  unlock_after_form: number
}

export type GeneratedForm = {
  id: string
  user_id: string
  user_email: string
  form_number: number
  filled_html: string
  is_locked: boolean
  is_submitted: boolean
  submitted_at: string | null
  generated_at: string
}

export type Invite = {
  id: string
  email: string
  role: 'admin' | 'agent'
  invited_by: string
  status: 'pending' | 'accepted'
  token: string
  created_at: string
}

export type Consent = {
  id: string
  user_email: string
  full_name: string | null
  agreed: boolean
  agreed_at: string | null
  ip_address: string | null
}

export type EmailLog = {
  id: string
  client_id: string | null
  recipient_email: string
  recipient_role: 'agent' | 'admin' | 'client'
  notification_type: 'payment_reminder' | 'forms_completed' | 'unlock_request' | 'unlock_approved'
  sent_at: string
}

export type UnlockRequest = {
  id: string
  client_id: string
  requested_by_agent_id: string
  approved_by_admin_id: string | null
  reason: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
}

export type PaymentVerification = {
  id: string
  user_id: string
  pop_file_url: string | null
  amount: number
  status: 'pending' | 'verified' | 'rejected'
  verified_by_admin_id: string | null
  created_at: string
  verified_at: string | null
}
