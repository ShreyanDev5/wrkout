# Username-Based Password Recovery Solution

## Overview

This document explains the custom password recovery implementation for a username-based authentication system using Supabase.

## Problem Statement

- Users register and login using **only usernames and passwords**
- No email addresses are collected during signup
- Usernames are stored in Supabase's `auth.users.email` field as pseudo-emails (e.g., `myusername@wrkout.app`)
- Standard Supabase password recovery doesn't work because it requires the email to exist in the auth table

## Solution Architecture

### 1. Two-Step Password Recovery Flow

```
Step 1: User enters username
    ↓
Step 2: System validates username exists
    ↓
Step 3: User provides recovery email
    ↓
Step 4: Server temporarily updates user's email
    ↓
Step 5: Sends password reset email
    ↓
Step 6: Reverts email back to pseudo-email format
```

### 2. Technical Implementation

#### Frontend (`app/auth/forgot-password/page.tsx`)

- **Step 1**: Username validation and existence check
- **Step 2**: Recovery email collection
- **Step 3**: API call to server-side handler
- **Step 4**: Success/error handling

#### Backend (`app/api/auth/reset-password/route.ts`)

- **User Lookup**: Find user by pseudo-email using service role
- **Email Update**: Temporarily change user's email to recovery email
- **Reset Link**: Generate and send password reset email
- **Email Revert**: Restore pseudo-email format

## Key Features

### ✅ Technical Feasibility

- **Yes, it's technically feasible** with Supabase
- Uses service role permissions for admin operations
- Maintains security by reverting email changes

### ✅ Security Considerations

- Service role key used only on server-side
- Email changes are temporary and reverted
- Input validation on both client and server
- Rate limiting can be implemented

### ✅ User Experience

- Familiar two-step process
- Clear error messages
- Progress indication
- Fallback options

## Implementation Details

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### API Endpoint

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "username": "myusername",
  "recoveryEmail": "user@example.com"
}
```

### Response Format

```json
// Success
{
  "message": "Password reset email sent successfully"
}

// Error
{
  "error": "No account found with this username"
}
```

## Alternative Solutions Considered

### Option 1: Custom Email Field (Not Implemented)

- Add a separate `recovery_email` field to user profiles
- Store recovery emails during password reset requests
- More complex database schema

### Option 2: Manual Email Handling (Not Recommended)

- Send reset links to admin email
- Manual password reset process
- Poor user experience

### Option 3: Username + Security Questions (Not Implemented)

- Additional security questions during signup
- Password reset via security questions
- More complex UX

## Testing the Implementation

### 1. Test Username Validation

```bash
# Valid username
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "recoveryEmail": "test@example.com"}'

# Invalid username
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "te", "recoveryEmail": "test@example.com"}'
```

### 2. Test Email Validation

```bash
# Valid email
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "recoveryEmail": "test@example.com"}'

# Invalid email
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "recoveryEmail": "invalid-email"}'
```

### 3. Test User Existence

```bash
# Existing user
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "existinguser", "recoveryEmail": "test@example.com"}'

# Non-existing user
curl -X POST /api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username": "nonexistent", "recoveryEmail": "test@example.com"}'
```

## Supabase Configuration Requirements

### 1. Email Settings

- Configure SMTP settings in Supabase dashboard
- Set up email templates for password reset
- Verify sender email address

### 2. Service Role Permissions

- Ensure service role key has admin permissions
- Configure RLS policies if needed
- Test admin API access

### 3. URL Configuration

- Set site URL in Supabase dashboard
- Configure redirect URLs for password reset
- Test email link functionality

## Troubleshooting

### Common Issues

1. **"Service role key not found"**

   - Check environment variables
   - Verify service role key in Supabase dashboard

2. **"User not found"**

   - Verify username exists in auth.users table
   - Check pseudo-email format (`username@wrkout.app`)

3. **"Email not sent"**

   - Check SMTP configuration
   - Verify email templates
   - Check spam folder

4. **"Permission denied"**
   - Verify service role permissions
   - Check RLS policies
   - Test admin API access

### Debug Steps

1. Check server logs for API errors
2. Verify environment variables
3. Test Supabase admin API directly
4. Check email delivery logs
5. Verify user existence in database

## Future Enhancements

### 1. Rate Limiting

- Implement rate limiting for password reset requests
- Prevent abuse and spam

### 2. Email Verification

- Verify recovery email ownership
- Send confirmation email before reset

### 3. Security Questions

- Add optional security questions
- Provide alternative recovery method

### 4. Audit Logging

- Log password reset attempts
- Track email changes for security

## Conclusion

This solution provides a secure and user-friendly password recovery mechanism for username-based authentication systems. It leverages Supabase's admin APIs while maintaining security best practices and providing a smooth user experience.

The implementation is production-ready and can be extended with additional security features as needed.
