import { NextRequest, NextResponse } from 'next/server';
import { validateUsername } from '@/lib/auth/auth-utils';
import { createServiceRoleClient, findUserByUsername } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const { username = '' } = (await request.json()) as { username?: string };
    const normalizedUsername = username.trim().toLowerCase();
    const usernameError = validateUsername(normalizedUsername);

    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const serviceRoleSupabase = createServiceRoleClient();
    const user = await findUserByUsername(serviceRoleSupabase, normalizedUsername);

    return NextResponse.json({ exists: Boolean(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
