import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is agent
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'agent') {
      return NextResponse.json({ error: 'Only agents can send emails' }, { status: 403 });
    }

    const { to, subject, message, clientName, attachment } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agentName = `${userRole.first_name || ''} ${userRole.last_name || ''}`.trim() || 'Agent';

    // Replace placeholders in message
    let finalMessage = message
      .replace(/\{client_name\}/g, clientName || 'Client')
      .replace(/\{agent_name\}/g, agentName);

    // Prepare email
    const emailOptions: any = {
      from: 'Techfuse DocControl <noreply@techfuseconsult.online>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e3a5f; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Techfuse DocControl</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <div style="white-space: pre-wrap; line-height: 1.6;">${finalMessage.replace(/\n/g, '<br>')}</div>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This message was sent by ${agentName} via the Techfuse DocControl platform.
              Please log in to your account to respond or upload documents securely.
            </p>
          </div>
        </div>
      `,
    };

    // Handle attachment if present
    if (attachment && attachment.content && attachment.filename) {
      const buffer = Buffer.from(attachment.content, 'base64');
      emailOptions.attachments = [
        {
          filename: attachment.filename,
          content: buffer,
        },
      ];
    }

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Insert into email logs
    await supabase
      .from('agent_email_logs')
      .insert({
        agent_id: user.id,
        agent_name: agentName,
        client_email: to,
        client_name: clientName,
        subject: subject,
        message: message,
        sent_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
