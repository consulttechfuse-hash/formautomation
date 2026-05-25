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
        <p>Your unlock request for <strong>${clientName}</strong> has been <span class="${status === 'approved' ? 'status-approved' : 'status-declined'}">${status.toUpperCase()}</span>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Request Details:</strong></p>
          <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Form:</strong> Form ${formNumber}</p>
          ${reason ? `<p style="margin: 5px 0;"><strong>Your Reason:</strong> ${reason}</p>` : ''}
          ${adminNotes ? `<p style="margin: 5px 0;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        </div>
        
        ${status === 'approved' ? `
          <p>The form has been unlocked. You can now help the client edit the form.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/agent/clients" class="button">View Client</a>
        ` : `
          <p>If you have questions about this decision, please contact your administrator.</p>
        `}
        
        <p style="margin-top: 20px;">Thank you,<br>The Techfuse Team</p>
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
