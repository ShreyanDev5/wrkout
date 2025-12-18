import { createClient, PostgrestError, AuthError } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Custom error types for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public originalError: PostgrestError) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public originalError: AuthError) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// Enhanced error handling function
export const handleSupabaseError = (error: unknown) => {
  if (error instanceof PostgrestError) {
    switch (error.code) {
      case '23505': // unique_violation
        throw new DatabaseError('A record with this data already exists', error)
      case '23503': // foreign_key_violation
        throw new DatabaseError('Referenced record does not exist', error)
      case '42P01': // undefined_table
        throw new DatabaseError('The requested table does not exist', error)
      default:
        throw new DatabaseError('Database operation failed', error)
    }
  }

  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        throw new AuthenticationError('Invalid email or password', error)
      case 'Email not confirmed':
        throw new AuthenticationError('Please confirm your email address', error)
      case 'User already registered':
        throw new AuthenticationError('An account with this email already exists', error)
      default:
        throw new AuthenticationError('Authentication failed', error)
    }
  }

  // Handle unknown errors
  if (error instanceof Error) {
    throw new Error(`An unexpected error occurred: ${error.message}`)
  }

  throw new Error('An unknown error occurred')
} 