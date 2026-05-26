'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function ClientFormPage() {
  const router = useRouter();
  const params = useParams();
  const formNumber = params?.formNumber as string;
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (formNumber) {
      loadForm();
    }
  }, [formNumber]);

  const loadForm = async () => {
    setLoading(true);
    
    // Get client's Form-01 data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get template
    const { data: template } = await supabase
      .from('form_templates')
      .select('template_html')
      .eq('form_number', parseInt(formNumber))
      .single();

    if (template?.template_html) {
      let populatedHtml = template.template_html;
      
      // Find all {{field}} placeholders
      const regex = /{{([^}]+)}}/g;
      const matches = populatedHtml.match(regex);
      
      if (matches) {
        matches.forEach((match: string) => {
          const key = match.replace(/{{/g, '').replace(/}}/g, '').trim();
          const value = form01 ? (form01[key] || '') : '';
          populatedHtml = populatedHtml.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });
      }
      
      // Add common placeholders
      const fullName = `${form01?.fn_t1 || ''} ${form01?.fln_t1 || ''}`.trim();
      populatedHtml = populatedHtml.replace(/{{full_name}}/g, fullName);
      populatedHtml = populatedHtml.replace(/{{current_date}}/g, new Date().toLocaleDateString());
      populatedHtml = populatedHtml.replace(/{{current_year}}/g, new Date().getFullYear().toString());
      
      setHtml(populatedHtml);
      setFormData(form01);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading form...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
