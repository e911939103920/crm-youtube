# Deploy GlassCRM to Vercel

This guide will help you deploy your GlassCRM application to Vercel in just a few minutes.

## Prerequisites

✅ Your code is already on GitHub (we just pushed it!)
✅ You have a Supabase account set up
✅ You have your Supabase credentials ready

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended - easiest way to connect)
4. Authorize Vercel to access your GitHub repositories

## Step 2: Import Your Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. Find your repository: `crm-youtube` (or `e911939103920/crm-youtube`)
3. Click **"Import"**

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install --legacy-peer-deps` ⚠️ **IMPORTANT**

**Note**: The project includes an `.npmrc` file that sets `legacy-peer-deps=true`, but Vercel may need the flag explicitly in the install command for the first deployment.

## Step 4: Add Environment Variables

**IMPORTANT**: Add these environment variables in Vercel before deploying:

1. In the project settings, go to **"Environment Variables"**
2. Add the following:

```
NEXT_PUBLIC_SUPABASE_URL=https://dpxzgszxxsojlcfetyll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_X11G8swcVH7EDF-SFR3JCQ_0sp27wG2
```

**How to add:**
- Click **"Add"** or **"Add Environment Variable"**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://dpxzgszxxsojlcfetyll.supabase.co`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Update Supabase Redirect URLs

Before deploying, update your Supabase settings:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add these redirect URLs:
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/reset-password`
4. Update **Site URL** to: `https://your-app-name.vercel.app`

**Note**: Replace `your-app-name` with your actual Vercel app name (you'll see it after deployment)

## Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for the build to complete
3. Vercel will show you a deployment URL like: `https://crm-youtube.vercel.app`

## Step 7: Test Your Deployment

1. Visit your deployment URL
2. You should see the landing page
3. Try signing up/logging in
4. Test the main features

## Post-Deployment Checklist

- [ ] Landing page loads correctly
- [ ] Can sign up for new account
- [ ] Can log in
- [ ] Dashboard loads with data
- [ ] Pipeline/Kanban works
- [ ] Leads can be created/edited
- [ ] Tasks feature works
- [ ] Settings page accessible

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Check that `node_modules` is in `.gitignore` (it is)

**Error: "Environment variable not found"**
- Double-check environment variables are set in Vercel
- Make sure they're prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables

### Authentication Issues

**"Invalid API key" error**
- Verify environment variables in Vercel match your `.env.local`
- Make sure Supabase redirect URLs are updated
- Check Supabase dashboard for any errors

**"Policy violation" error**
- Ensure you've run the `supabase/schema.sql` in Supabase
- Check that RLS policies are created

### Database Connection Issues

**"Failed to fetch" errors**
- Check Supabase project is active
- Verify API keys are correct
- Check Supabase logs for errors

## Custom Domain (Optional)

1. In Vercel project settings, go to **"Domains"**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update Supabase redirect URLs to include your custom domain

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Deploys to production
- Push to other branches → Creates preview deployments
- Pull requests → Creates preview deployments automatically

## Updating Your App

To update your deployed app:

```bash
# Make your changes locally
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically detect the push and redeploy! 🚀

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables are set correctly
4. Ensure database schema is run in Supabase

---

**That's it!** Your GlassCRM is now live on Vercel! 🎉
