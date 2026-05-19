import { NextRequest, NextResponse } from 'next/server';
import { createPseudoEmail, validateUsername } from '@/lib/auth/auth-utils';
import { createServiceRoleClient, findUserByUsername } from '@/lib/auth/server';

type ResetPasswordRequest = {
  username?: string;
  recoveryEmail?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendPasswordResetEmail(params: {
  to: string;
  username: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;

  if (!apiKey || !from) {
    return { configured: false, error: null };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: 'Reset your wrkout password',
      html: `
        <p>Hi ${params.username},</p>
        <p>Use this link to reset your wrkout password:</p>
        <p><a href="${params.resetUrl}">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
      text: `Hi ${params.username},\n\nUse this link to reset your wrkout password:\n${params.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    return {
      configured: true,
      error: `Email provider returned ${response.status}`,
    };
  }

  return { configured: true, error: null };
}

export async function POST(request: NextRequest) {
  try {
    const { username = '', recoveryEmail = '' } = (await request.json()) as ResetPasswordRequest;
    const normalizedUsername = username.trim().toLowerCase();
    const usernameError = validateUsername(normalizedUsername);

    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(recoveryEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const serviceRoleSupabase = createServiceRoleClient();
    const user = await findUserByUsername(serviceRoleSupabase, normalizedUsername);

    if (!user) {
      return NextResponse.json({ error: 'No account found with this username' }, { status: 404 });
    }

    const redirectTo = `${request.nextUrl.origin}/auth/reset-password`;
    const { data, error } = await serviceRoleSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: createPseudoEmail(normalizedUsername),
      options: { redirectTo },
    });

    if (error || !data.properties?.action_link) {
      return NextResponse.json(
        { error: error?.message || 'Failed to generate password reset link' },
        { status: 500 }
      );
    }

    const delivery = await sendPasswordResetEmail({
      to: recoveryEmail,
      username: normalizedUsername,
      resetUrl: data.properties.action_link,
    });

    if (delivery.error) {
      return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 502 });
    }

    if (!delivery.configured) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          {
            message: 'Password reset link generated. Email delivery is not configured.',
            resetUrl: data.properties.action_link,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Password reset email delivery is not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
