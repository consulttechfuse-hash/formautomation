import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendUnlockNotificationParams {
  toEmail: string;
  agentName: string;
  clientName: string;
  formNumber: number;
  status: 'approved' | 'declined';
  reason?: string;
  adminNotes?: string;
}

export async function sendUnlockNotification(params: SendUnlockNotificationParams) {
  const { toEmail, agentName, clientName, formNumber, status, reason, adminNotes } = params;

  const subject = `Unlock Request ${status === 'approved' ? 'Approved' : 'Declined'} - Form ${formNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${status === 'approved' ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .status-approved { color: #10b981; font-weight: bold; }
        .status-declined { color: #ef4444; font-weight: bold; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Unlock Request ${status === 'approved' ? '✅ Approved' : '❌ Declined'}</h2>
      </div>
      <div class="content">
        <p>Dear <strong>${agentName}</strong>,</p>
        <p>Your unlock request for <strong>${clientName}</strong> (Form ${formNumber}) has been <span class="${status === 'approved' ? 'status-approved' : 'status-declined'}">${status.toUpperCase()}</span>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Request Details:</strong></p>
          ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
          ${adminNotes ? `<p style="margin: 5px 0;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        </div>
        
        <p>Thank you,<br>The Techfuse Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Techfuse DocControl Service. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Techfuse <notifications@techfuseconsult.online>',
      to: toEmail,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Send invitation email for admins/agents
export async function sendInvitationEmail(params: {
  toEmail: string;
  role: 'admin' | 'agent';
  inviteLink: string;
  invitedByEmail?: string;
  expiresAt: Date;
}) {
  const { toEmail, role, inviteLink, invitedByEmail, expiresAt } = params;

  const roleTitle = role === 'admin' ? 'Admin' : 'Agent';
  const roleDescription = role === 'admin' 
    ? 'manage the platform, invite agents, and oversee client operations.'
    : 'assist clients with their forms and provide support.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Techfuse Consulting</h2>
        <p>${roleTitle} Invitation</p>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>You have been invited to become an <strong>${roleTitle}</strong> on the Techfuse DocControl platform.</p>
        ${invitedByEmail ? `<p>This invitation was sent by: <strong>${invitedByEmail}</strong></p>` : ''}
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>As an ${roleTitle}, you will be able to:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>${roleDescription}</li>
            <li>Access the ${roleTitle.toLowerCase()} portal dashboard</li>
            ${role === 'admin' ? '<li>Invite and manage agents under your supervision</li>' : '<li>Work with clients assigned to your admin</li>'}
          </ul>
        </div>
        
        <p>Click the button below to accept your invitation and set up your account:</p>
        
        <div style="text-align: center;">
          <a href="${inviteLink}" class="button">Accept Invitation</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">This invitation expires on ${expiresAt.toLocaleDateString()}.</p>
        <p>If you did not expect this invitation, you can ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px; margin: 0;">Techfuse Consulting - Secure Document Control Service</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Techfuse <noreply@techfuseconsult.online>',
      to: toEmail,
      subject: `You've been invited as a ${roleTitle} - Techfuse DocControl`,
      html: html,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error };
    }
    
    console.log('Invitation email sent to:', toEmail);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error };
  }
}
