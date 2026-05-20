import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/auth/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS_PER_HOUR = 5;

async function sendVerificationEmail(params: {
  to: string;
  code: string;
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
      subject: 'Your wrkout verification code',
      html: `
        <p>Your verification code for password recovery is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${params.code}</p>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
      text: `Your verification code for password recovery is:\n\n${params.code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
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

function generateVerificationCode(): string {
  // Use cryptographically secure random number generation
  const arr = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(x => (x % 10).toString()).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { email = '' } = (await request.json()) as { email?: string };

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Rate limiting: check if email has exceeded max attempts in the last hour
    const supabase = createServiceRoleClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentCodes } = await supabase
      .from('verification_codes')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .gt('created_at', oneHourAgo);

    if (recentCodes && recentCodes.length >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please try again later.' },
        { status: 429 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store code in Supabase (table should have columns: id, email, code, expires_at, used_at, created_at)
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert([
        {
          email,
          code,
          expires_at: expiresAt,
        },
      ]);

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    const delivery = await sendVerificationEmail({
      to: email,
      code,
    });

    if (delivery.error) {
      return NextResponse.json({ error: 'Failed to send verification code' }, { status: 502 });
    }

    if (!delivery.configured) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          {
            message: 'Verification code generated. Email delivery is not configured.',
            code,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Email delivery is not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Unexpected error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    const code = request.nextUrl.searchParams.get('code');

    if (!email || !code) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    
    // Retrieve the most recent unused code for this email
    const { data: records } = await supabase
      .from('verification_codes')
      .select('id, code, expires_at')
      .eq('email', email)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const record = records[0];
    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    // Use constant-time comparison to prevent timing attacks
    const isCodeValid = timingSafeEqual(record.code, code);

    if (!isCodeValid || now > expiresAt) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Mark code as used so it can only be used once
    await supabase
      .from('verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', record.id);

    return NextResponse.json({ verified: true, email });
  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
