import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { createPseudoEmail } from './auth-utils';

export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role credentials are not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function findUserByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<User | null> {
  const pseudoEmail = createPseudoEmail(username);
  let page = 1;
  const perPage = 1000;

  while (true) {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const user = users.find((candidate) => candidate.email?.toLowerCase() === pseudoEmail);
    if (user) {
      return user;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}
