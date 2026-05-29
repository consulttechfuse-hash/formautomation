import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role, email')
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Use built-in crypto.randomUUID()
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation record
    await supabase
      .from('user_roles')
      .insert({
        email: email,
        role: 'agent',
        invited_by: session.user.id,
        assigned_admin_id: session.user.id,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    
    // Send invitation email via Resend
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@techfuseconsult.online',
        to: email,
        subject: 'You have been invited as an Agent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background-color: #1e3a8a; color: white; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">Techfuse Consulting</h1>
              <p style="margin: 5px 0 0;">Agent Invitation</p>
            </div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello,</p>
              <p>You have been invited to become an <strong>Agent</strong> on the Techfuse DocControl platform.</p>
              <p>Click the button below to accept your invitation and set up your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p>This invitation expires on ${expiresAt.toLocaleDateString()}.</p>
              <p>If you did not expect this invitation, you can ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Techfuse Consulting - Secure Document Control Service</p>
            </div>
          </div>
        `,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend error:', errorData);
    }
    
    return NextResponse.json({ success: true, message: 'Agent invited successfully', inviteLink });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent' }, { status: 500 });
  }
}
