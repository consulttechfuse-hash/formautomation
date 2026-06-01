import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    // Send email to your company
    const { data, error } = await resend.emails.send({
      from: 'Techfuse Contact <noreply@techfuseconsult.online>',
      to: ['info@techfuseconsult.online'],
      subject: `New Contact Form Submission from ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #D54022; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TechFuse Consulting</h1>
            <p>New Contact Form Submission</p>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">${message}</p>
          </div>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>This message was sent from the TechFuse Consulting contact form.</p>
          </div>
        </div>
      `,
    });
    
    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Optional: Send auto-reply to the person who submitted the form
    await resend.emails.send({
      from: 'Techfuse Consulting <noreply@techfuseconsult.online>',
      to: [email],
      subject: 'Thank you for contacting TechFuse Consulting',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #D54022; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TechFuse Consulting</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb;">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to TechFuse Consulting. We have received your message and will get back to you within 24-48 hours.</p>
            <p>Here is a copy of your message:</p>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">${message}</p>
            <p>Best regards,<br><strong>The TechFuse Consulting Team</strong></p>
          </div>
        </div>
      `,
    }).catch(err => console.log('Auto-reply error (non-critical):', err));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
