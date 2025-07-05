# Supabase Setup Guide

## Issue

The app is showing a Supabase error because the environment variables are not configured. This is preventing users from signing up or signing in.

## Solution

### 1. Create Environment File

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Paste them in your `.env.local` file

### 3. Database Schema

The app expects these tables in your Supabase database:

#### `workouts` table

```sql
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_time TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own data
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);
```

#### `workout_logs` table

```sql
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  avg_reps DECIMAL(4,1) NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workout_type TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Authentication Settings

In your Supabase project:

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL (e.g., `http://localhost:3000`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/signin`
   - `http://localhost:3000/auth/signup`

### 5. Test the Setup

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Try signing up with a new account
3. Check the browser console for any remaining errors

## Troubleshooting

### Common Issues

1. **"Missing env.NEXT_PUBLIC_SUPABASE_URL"**

   - Make sure `.env.local` exists and has the correct variables
   - Restart the development server after creating the file

2. **"Table does not exist"**

   - Run the SQL commands above in your Supabase SQL editor
   - Make sure the table names match exactly

3. **"RLS policy violation"**

   - Check that Row Level Security policies are created correctly
   - Verify that `auth.uid()` is working properly

4. **"Invalid login credentials"**
   - Check that the Supabase URL and key are correct
   - Verify that authentication is enabled in your Supabase project

### Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and not paused
3. Check the Supabase dashboard logs for any server-side errors
4. Ensure your database is in the same region as your app for better performance

## Quick Setup Commands

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Start local development
supabase start

# Apply migrations
supabase db push
```

This will set up a local Supabase instance for development.
