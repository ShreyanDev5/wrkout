import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, recoveryEmail } = await request.json();
    
    console.log('🔍 Password reset request:', { username, recoveryEmail });
    
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
    console.log('🔍 Looking for user with pseudo-email:', pseudoEmail);
    
    // Create a service role client for admin operations
    const { createClient } = await import('@supabase/supabase-js');
    const serviceRoleSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use the same method as frontend: try to sign in with dummy password
    console.log('🔍 Checking user existence using signInWithPassword...');
    let user = null;
    
    try {
      // Try to sign in with dummy password to check if user exists
      const { data: { user: foundUser }, error: signInError } = await serviceRoleSupabase.auth.signInWithPassword({
        email: pseudoEmail,
        password: 'dummy-password-to-check-existence'
      });
      
      if (foundUser) {
        user = foundUser;
        console.log('✅ User found via signInWithPassword');
      } else if (signInError) {
        // If we get "Invalid login credentials", the user exists but password is wrong
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('✅ User exists (invalid credentials expected)');
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
          if (user) {
            console.log('✅ User found via listUsers fallback');
          }
        } else if (signInError.message.includes('User not found')) {
          console.log('❌ User not found');
        } else {
          console.log('⚠️ Unexpected signIn error:', signInError.message);
        }
      }
    } catch (err) {
      console.log('⚠️ SignIn method failed, using listUsers fallback:', err);
      // Fallback to listUsers
      const { data: { users }, error: listError } = await serviceRoleSupabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error fetching users:', listError);
        return NextResponse.json(
          { error: 'Failed to check user existence' },
          { status: 500 }
        );
      }
      
      console.log('🔍 Total users found:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('🔍 User emails:', users.map(u => u.email).slice(0, 5));
      }
      
      user = users?.find(u => u.email === pseudoEmail);
    }
    
    if (!user) {
      console.log('❌ User not found with email:', pseudoEmail);
      return NextResponse.json(
        { error: 'No account found with this username' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', { id: user.id, email: user.email });

    // Temporarily update the user's email to the recovery email
    console.log('🔄 Updating user email to recovery email...');
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

    console.log('✅ User email updated successfully');

    // Send password reset email to the recovery email
    const redirectUrl = `${request.nextUrl.origin}/auth/reset-password`;
    console.log('📧 Sending password reset email to:', recoveryEmail);
    console.log('🔗 Redirect URL:', redirectUrl);
    
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

    console.log('✅ Password reset email sent successfully');

    // Revert the email back to the pseudo-email format
    console.log('🔄 Reverting user email back to pseudo-email...');
    const { error: revertError } = await serviceRoleSupabase.auth.admin.updateUserById(
      user.id,
      { email: pseudoEmail }
    );

    if (revertError) {
      console.error('❌ Error reverting user email:', revertError);
      // Don't fail the request, but log the error
    } else {
      console.log('✅ User email reverted successfully');
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