import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import HTMLtoDOCX from 'html-to-docx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const formNumber = searchParams.get('form');
    const userId = searchParams.get('userId');
    const allForms = searchParams.get('all') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user email and form01 data
    let userEmail = '';
    let form01 = null;
    
    const { data: form01Data } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    form01 = form01Data;

    const { data: userRecord } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    if (userRecord) {
      userEmail = userRecord.email;
    }

    function replacePlaceholders(html: string, data: any): string {
      if (!data || !html) return html;
      let result = html;
      
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = data[key] || '';
        result = result.replace(regex, value);
      });
      
      const fullName = `${data?.fn_t1 || ''} ${data?.mdn_t1 || ''} ${data?.srn_t1 || ''}`.trim();
      result = result.replace(/{{full_name}}/g, fullName);
      result = result.replace(/{{full_name_upper}}/g, fullName.toUpperCase());
      result = result.replace(/{{current_date}}/g, new Date().toLocaleDateString());
      result = result.replace(/{{current_year}}/g, new Date().getFullYear().toString());
      result = result.replace(/{{current_month}}/g, (new Date().getMonth() + 1).toString());
      result = result.replace(/{{current_day}}/g, new Date().getDate().toString());
      result = result.replace(/{{sdy_t1}}/g, new Date().getDate().toString());
      result = result.replace(/{{smth_t1}}/g, new Date().toLocaleString('default', { month: 'long' }));
      
      return result;
    }

    async function generateDOCX(htmlContent: string, title: string): Promise<Buffer> {
      const fullHtml = `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
            .title { text-transform: uppercase; font-size: 18px; font-weight: bold; text-align: center; }
            hr { margin: 30px 0; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>`;

      return await HTMLtoDOCX(fullHtml, '', {
        orientation: 'portrait',
        pageSize: { width: 12240, height: 15840 },
        margins: { top: 1440, right: 1800, bottom: 1440, left: 1800 },
        font: 'Arial',
        footer: false,
        header: false,
      });
    }

    // Form name mappings
    const formNames: Record<number, string> = {
      2: 'Form 02 - Common Carry Declaration',
      3: 'Form 03 - Notice of Intent and Fee Schedule',
      4: 'Form 04 - Birth Registration and Certificate Application',
      5: 'Form 05 - Declaration of Citizenship',
      6: 'Form 06 - Witness Testimony 1',
      7: 'Form 07 - Witness Testimony 2',
      8: 'Form 08 - Act of Expatriation',
      9: 'Form 09 - Deed of Land Recording',
      10: 'Form 10 - Cancellation of Powers of Attorney',
      11: 'Form 11 - Affidavit of Truth',
      12: 'Form 12 - Claim of Life and Estate',
      13: 'Form 13 - Deed of Reconveyance',
      14: 'Form 14 - Mandatory Notice of Liability',
      15: 'Form 15 - Final Declaration',
      16: 'Form 16 - Completion Certificate',
      17: 'Form 17 - Final Submission and Lock'
    };

    // Get consent form
    const { data: consentData } = await supabase
      .from('consents')
      .select('html_content')
      .eq('cont_key', 'consent')
      .single();

    let consentHtml = '';
    if (consentData?.html_content) {
      consentHtml = replacePlaceholders(consentData.html_content, form01);
    }

    // If single form requested - return single DOCX
    if (formNumber && !allForms) {
      const num = parseInt(formNumber);
      
      // Special handling for consent form (formNumber = 0)
      if (num === 0) {
        const docxBuffer = await generateDOCX(`<h1 style="text-align:center;">CONSENT FORM</h1>${consentHtml}`, 'Consent Form');
        return new NextResponse(docxBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="Consent_Form.docx"`,
          },
        });
      }
      
      const { data: template } = await supabase
        .from('form_templates')
        .select('template_html')
        .eq('form_number', num)
        .single();

      let html = '';
      if (template?.template_html) {
        html = replacePlaceholders(template.template_html, form01);
      } else {
        const fullName = form01 ? `${form01?.fn_t1 || ''} ${form01?.mdn_t1 || ''} ${form01?.srn_t1 || ''}`.trim() : 'User';
        html = `<h2>${formNames[num] || `Form ${num}`}</h2><p>Full Name: ${fullName}</p><p>Email: ${userEmail}</p>`;
      }

      const docxBuffer = await generateDOCX(html, formNames[num] || `Form ${num}`);
      const filename = `${formNames[num] || `form-${String(num).padStart(2, '0')}`}.docx`.replace(/\s/g, '_');

      return new NextResponse(docxBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // If all forms requested - return HTML page with download links
    if (allForms) {
      const baseUrl = request.nextUrl.origin;
      let linksHtml = '<!DOCTYPE html><html><head><title>Download All Forms</title>';
      linksHtml += '<style>';
      linksHtml += 'body{font-family:Arial, sans-serif;padding:40px;max-width:600px;margin:0 auto;}';
      linksHtml += 'a{display:block;margin:10px 0;padding:12px;background:#f0f0f0;border-radius:5px;text-decoration:none;color:#0066cc;}';
      linksHtml += 'a:hover{background:#e0e0e0;}';
      linksHtml += 'h1{color:#333;}';
      linksHtml += '.back-btn{background:#0066cc;color:white;text-align:center;margin-top:30px;}';
      linksHtml += '.back-btn:hover{background:#0055aa;}';
      linksHtml += '</style>';
      linksHtml += '</head><body>';
      linksHtml += '<h1>Download Your Forms</h1>';
      linksHtml += '<p>Click each link below to download the individual DOCX files:</p>';
      
      // Add Consent Form link
      linksHtml += `<a href="${baseUrl}/api/forms/download-docx?form=0&userId=${userId}">📄 Consent Form</a>`;
      
      // Add Forms 02-17 links
      for (let i = 2; i <= 17; i++) {
        linksHtml += `<a href="${baseUrl}/api/forms/download-docx?form=${i}&userId=${userId}">📄 ${formNames[i] || `Form ${String(i).padStart(2, '0')}`}</a>`;
      }
      
      linksHtml += '<hr>';
      linksHtml += '<button onclick="window.location.href=\'/forms/check-submit\'" class="back-btn" style="padding:12px 20px;cursor:pointer;border:none;border-radius:5px;font-size:14px;">← Back to Check & Submit Page</button>';
      linksHtml += '</body></html>';
      
      return new NextResponse(linksHtml, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX: ' + (error as Error).message }, { status: 500 });
  }
}
