# Supabase Setup Instructions

## Quick Setup

### 1. Environment File ✅

The `.env.local` file has been created with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dpxzgszxxsojlcfetyll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_X11G8swcVH7EDF-SFR3JCQ_0sp27wG2
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

This creates:
- ✅ `profiles` table
- ✅ `pipelines` table  
- ✅ `leads` table
- ✅ Row Level Security policies (users can only see their own data)
- ✅ Automatic triggers for profile creation and timestamps

### 3. Configure Authentication Redirects

1. In Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production, when ready)
3. Set Site URL to: `http://localhost:3000` (for development)

### 4. Restart Your Dev Server

After creating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Test It Out

1. Visit `http://localhost:3000`
2. You should see the landing page
3. Click "Get Started" or "Sign Up"
4. Create an account
5. Check Supabase dashboard:
   - **Authentication** > **Users** - should see your new user
   - **Table Editor** > **profiles** - should see your profile
   - **Table Editor** > **pipelines** - should see 5 default pipelines

## What's Been Set Up

✅ **Authentication**: Signup/Login with Supabase Auth
✅ **Database Schema**: Tables for profiles, pipelines, and leads
✅ **Row Level Security**: Users can only access their own data
✅ **Automatic Profile Creation**: Profile created when user signs up
✅ **Default Pipelines**: 5 default pipeline stages created for new users
✅ **Landing Page**: Beautiful landing page at `/`
✅ **Protected Routes**: Dashboard, Pipeline, Leads, etc. require authentication
✅ **Data Persistence**: All data saved to Supabase (not localStorage)

## Features

- **Privacy**: Each user only sees their own leads and pipelines
- **Real-time**: Data syncs automatically with Supabase
- **Secure**: Row Level Security ensures data isolation
- **Scalable**: Ready for production deployment

## Troubleshooting

**"Invalid API key" error:**
- Check `.env.local` has correct values
- Restart dev server after changing env variables
- Make sure there are no spaces or quotes around the values

**"Policy violation" error:**
- Make sure you ran the `schema.sql` file
- Check that RLS policies exist in Supabase dashboard

**Profile not created:**
- Check Supabase logs for errors
- Verify the trigger function was created

**Can't sign up:**
- Check Supabase Auth settings
- Verify email confirmation is disabled (for testing) or check your email

## Next Steps

1. ✅ Set up environment variables - **DONE!**
2. ⏳ Run database schema (see step 2 above)
3. ⏳ Configure auth redirects (see step 3 above)
4. ⏳ Restart dev server and test
5. 🎉 Start using the app!

For production:
- Set up custom domain
- Configure email templates
- Set up backups
- Add monitoring
