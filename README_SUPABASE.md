# Supabase Setup Guide for GlassCRM

## Prerequisites
- Supabase account
- Your Supabase project URL and anon key

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings > API

## Step 2: Set Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual values:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Step 3: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script

This will create:
- `profiles` table (user profiles)
- `pipelines` table (pipeline stages)
- `leads` table (lead data)
- Row Level Security (RLS) policies
- Triggers for automatic profile creation and timestamps

## Step 4: Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try signing up a new account
4. Check Supabase dashboard to verify:
   - User was created in `auth.users`
   - Profile was created in `profiles`
   - Default pipelines were created

## Database Schema Overview

### Tables

**profiles**
- Extends auth.users with additional user information
- Automatically created when user signs up

**pipelines**
- Stores pipeline stages (New, Contacted, Proposal, Won, Lost)
- Default pipelines created automatically for new users

**leads**
- Stores all lead information
- Linked to user via `user_id`
- Supports tags (array), notes, and custom fields

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see their own data
- Users can only create/update/delete their own data
- Automatic enforcement via Supabase policies

## Features

✅ User authentication (signup/login)
✅ Automatic profile creation
✅ Default pipelines for new users
✅ Secure data isolation (users only see their data)
✅ Real-time data synchronization
✅ Automatic timestamps

## Troubleshooting

**Issue: "Invalid API key"**
- Check your `.env.local` file has correct values
- Restart your dev server after changing env variables

**Issue: "Policy violation"**
- Ensure RLS policies are created (run schema.sql)
- Check that user is authenticated

**Issue: "Profile not created"**
- Check the trigger function exists
- Verify in Supabase logs for errors

## Next Steps

- Set up email templates in Supabase Auth
- Configure custom domain (production)
- Set up backups
- Add additional tables as needed
