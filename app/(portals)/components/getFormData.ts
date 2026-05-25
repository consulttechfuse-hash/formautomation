import { createClient } from '@/lib/supabase/client';

export async function getFormData(clientId: string, formNumber: number) {
  const supabase = createClient();
  
  // Get the latest template from form_templates (owner's edits)
  const { data: template } = await supabase
    .from('form_templates')
    .select('template_html')
    .eq('form_number', formNumber)
    .single();
  
  if (!template?.template_html) {
    return null;
  }
  
  // Get client's Form-01 data for placeholders
  const { data: form01 } = await supabase
    .from('form01_data')
    .select('*')
    .eq('user_id', clientId)
    .single();
  
  let html = template.template_html;
  
  if (form01) {
    // Replace all {{field}} placeholders with actual data
    Object.keys(form01).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, form01[key] || '');
    });
  }
  
  // Add common placeholders
  const fullName = `${form01?.fn_t1 || ''} ${form01?.fln_t1 || ''}`.trim();
  html = html.replace(/{{full_name}}/g, fullName);
  html = html.replace(/{{current_date}}/g, new Date().toLocaleDateString());
  html = html.replace(/{{current_year}}/g, new Date().getFullYear().toString());
  html = html.replace(/{{current_month}}/g, (new Date().getMonth() + 1).toString());
  html = html.replace(/{{current_day}}/g, new Date().getDate().toString());
  
  return { filled_html: html, form_number: formNumber, user_id: clientId };
}
