-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'client',
  admin_id UUID,
  has_paid BOOLEAN DEFAULT FALSE,
  has_consented BOOLEAN DEFAULT FALSE,
  profile_photo_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  onboarding_submitted BOOLEAN DEFAULT FALSE,
  onboarding_locked BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  last_completed_form INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  id_document_url TEXT
);

-- Form templates table
CREATE TABLE IF NOT EXISTS public.form_templates (
  id SERIAL PRIMARY KEY,
  form_number INTEGER UNIQUE NOT NULL,
  template_html TEXT NOT NULL,
  unlock_after_form INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form01 data table
CREATE TABLE IF NOT EXISTS public.form01_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated forms table
CREATE TABLE IF NOT EXISTS public.generated_forms (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  form_number INTEGER NOT NULL,
  filled_html TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  is_submitted BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_user_form UNIQUE (user_id, form_number)
);

-- Download logs table
CREATE TABLE IF NOT EXISTS public.download_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  form_number INTEGER,
  download_type TEXT,
  ip_address TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consents table
CREATE TABLE IF NOT EXISTS public.consents (
  id SERIAL PRIMARY KEY,
  cont_key TEXT UNIQUE,
  html_content TEXT,
  title TEXT
);
