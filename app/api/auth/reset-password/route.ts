import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, recoveryEmail } = await request.json();
    
    if (!username || !recoveryEmail) {
      return NextResponse.json(
        { error: 'Username and recovery email are required' },
        { status: 400 }
      );
    }

    // Validate username format
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Construct the pseudo-email
    const pseudoEmail = `${username}@wrkout.app`;
    
    // Create a service role client for admin operations
    const { createClient } = await import('@supabase/supabase-js');
    const serviceRoleSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use the same method as frontend: try to sign in with dummy password
    let user = null;
    
    try {
      // Try to sign in with dummy password to check if user exists
      const { data: { user: foundUser }, error: signInError } = await serviceRoleSupabase.auth.signInWithPassword({
        email: pseudoEmail,
        password: 'dummy-password-to-check-existence'
      });
      
      if (foundUser) {
        user = foundUser;
      } else if (signInError) {
        // If we get "Invalid login credentials", the user exists but password is wrong
        if (signInError.message.includes('Invalid login credentials')) {
          // We need to get the user details, so let's use listUsers as fallback
          const { data: { users }, error: listError } = await serviceRoleSupabase.auth.admin.listUsers();
          
          if (listError) {
            console.error('❌ Error fetching users:', listError);
            return NextResponse.json(
              { error: 'Failed to check user existence' },
              { status: 500 }
            );
          }
          
          user = users?.find(u => u.email === pseudoEmail);
        } else if (signInError.message.includes('User not found')) {
          // console.log('❌ User not found'); // Removed
        } else {
          // console.log('⚠️ Unexpected signIn error:', signInError.message); // Removed
        }
      }
    } catch (err) {
      // console.log('⚠️ SignIn method failed, using listUsers fallback:', err); // Removed
      // Fallback to listUsers
      const { data: { users }, error: listError } = await serviceRoleSupabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error fetching users:', listError);
        return NextResponse.json(
          { error: 'Failed to check user existence' },
          { status: 500 }
        );
      }
      
      user = users?.find(u => u.email === pseudoEmail);
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this username' },
        { status: 404 }
      );
    }

    // Temporarily update the user's email to the recovery email
    const { error: updateError } = await serviceRoleSupabase.auth.admin.updateUserById(
      user.id,
      { email: recoveryEmail }
    );

    if (updateError) {
      console.error('❌ Error updating user email:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user email for password reset' },
        { status: 500 }
      );
    }

    // Send password reset email to the recovery email
    const redirectUrl = `${request.nextUrl.origin}/auth/reset-password`;
    
    const { error: resetError } = await serviceRoleSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: recoveryEmail,
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (resetError) {
      console.error('❌ Error generating reset link:', resetError);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    // Revert the email back to the pseudo-email format
    const { error: revertError } = await serviceRoleSupabase.auth.admin.updateUserById(
      user.id,
      { email: pseudoEmail }
    );

    if (revertError) {
      console.error('❌ Error reverting user email:', revertError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 