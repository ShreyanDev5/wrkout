# Forgot Password Troubleshooting Guide

## Issue: No emails received when using forgot password functionality

### ✅ What We've Confirmed

1. **Code is working correctly** - The Supabase API returns success
2. **Environment variables are properly configured**
3. **Frontend implementation is correct**

### 🔍 Root Cause Analysis

The issue is likely in the **Supabase email configuration**, not the code. Here's how to diagnose and fix it:

## Step-by-Step Troubleshooting

### 1. Check Supabase Dashboard Email Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`izbdlaygeupakdhuodlk`)
3. Navigate to **Authentication** → **Settings**
4. Check the following sections:

#### SMTP Settings

- **SMTP Host**: Should be configured (e.g., `smtp.gmail.com`)
- **SMTP Port**: Usually `587` for TLS
- **SMTP User**: Your email username
- **SMTP Pass**: Your email password or app password
- **Sender Name**: Display name for emails
- **Sender Email**: The email address that will send the reset emails

#### Email Templates

- **Password Reset Template**: Should be configured
- **Template Content**: Should include the reset link

### 2. Common Email Provider Configurations

#### Gmail

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: [App Password - NOT your regular password]
```

**Important**: For Gmail, you need to:

1. Enable 2-factor authentication
2. Generate an "App Password" in Google Account settings
3. Use the app password, not your regular password

#### Outlook/Hotmail

```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Pass: your-email-password
```

#### SendGrid

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
```

### 3. Test Email Configuration

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Look for "Test Email" or "Send Test Email" button
3. Send a test email to verify configuration

### 4. Check Email Templates

1. Go to **Authentication** → **Email Templates**
2. Verify the "Password Reset" template exists
3. Check that it includes:
   - Proper subject line
   - Reset link with `{{ .ConfirmationURL }}`
   - Professional formatting

### 5. Verify Domain Configuration

If using a custom domain:

1. Ensure DNS records are properly configured
2. Check SPF, DKIM, and DMARC records
3. Verify domain is verified in Supabase

### 6. Check Email Delivery

1. **Check Spam/Junk Folder**: Emails often land here
2. **Wait 5-10 minutes**: Email delivery can be delayed
3. **Try different email addresses**: Test with Gmail, Outlook, etc.
4. **Check email provider logs**: Some providers block certain SMTP servers

## Quick Fixes to Try

### Option 1: Use Supabase's Built-in Email Service

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Disable custom SMTP settings
3. Use Supabase's default email service (limited but works)

### Option 2: Use a Transactional Email Service

1. Sign up for [SendGrid](https://sendgrid.com/) (free tier available)
2. Configure SMTP settings with SendGrid credentials
3. This is more reliable than personal email providers

### Option 3: Use Gmail with App Password

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Use the App Password in SMTP settings

## Testing the Fix

After configuring email settings:

1. **Run the test script**:

   ```bash
   node test-forgot-password.js your-email@example.com
   ```

2. **Test through the UI**:

   - Go to `/auth/forgot-password`
   - Enter your email
   - Check for success message
   - Monitor your email inbox

3. **Check browser console** for any errors

## Monitoring and Logs

### Supabase Logs

1. Go to **Logs** in your Supabase dashboard
2. Filter by "auth" to see authentication events
3. Look for email sending attempts and any errors

### Browser Console

1. Open browser developer tools
2. Go to Console tab
3. Try the forgot password flow
4. Look for any error messages

## Common Error Messages and Solutions

| Error                    | Solution                              |
| ------------------------ | ------------------------------------- |
| "SMTP connection failed" | Check SMTP host/port and credentials  |
| "Authentication failed"  | Verify username/password              |
| "Sender not authorized"  | Check sender email configuration      |
| "Rate limit exceeded"    | Wait before trying again              |
| "Template not found"     | Configure email templates in Supabase |

## Next Steps

1. **Configure SMTP settings** in Supabase dashboard
2. **Test with a real email address**
3. **Monitor email delivery**
4. **Check spam folder**
5. **Verify email templates**

If you're still having issues after following these steps, the problem is likely with the email provider configuration or network restrictions.
