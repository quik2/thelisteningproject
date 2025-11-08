# Deployment Instructions for Vercel

## Step 1: Set up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/guqcshanceaicppjlmyr
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to create the table and policies

## Step 2: Configure Vercel Environment Variables

When deploying to Vercel, add these environment variables in your project settings:

```
# Client-side variables (used during build)
VITE_SPOTIFY_CLIENT_ID=1a404cb911654d09a8d7716c74ab068b
VITE_SPOTIFY_CLIENT_SECRET=82b8350f37954c2c9b9a7f6bbbd2821b
VITE_SUPABASE_URL=https://guqcshanceaicppjlmyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWNzaGFuY2VhaWNwcGpsbXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTY1OTIsImV4cCI6MjA3ODEzMjU5Mn0.0sCBWu5VDsrN65UHLMr3_q3V83aj5FO_XK8oO0gU5aY

# Server-side variables (used in API routes at runtime)
SPOTIFY_CLIENT_ID=1a404cb911654d09a8d7716c74ab068b
SPOTIFY_CLIENT_SECRET=82b8350f37954c2c9b9a7f6bbbd2821b
SUPABASE_URL=https://guqcshanceaicppjlmyr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWNzaGFuY2VhaWNwcGpsbXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU1NjU5MiwiZXhwIjoyMDc4MTMyNTkyfQ.L9lZkym3zSQ-XI2TZs9rLAoyNrPDzxKgkDbkGWErsLk
```

**Important**: You need BOTH sets of variables. The `VITE_` prefixed ones are used during the build process for the client-side code, while the non-prefixed ones are used at runtime in the API routes.

## Step 3: Deploy

1. Push your code to GitHub (already done!)
2. Go to Vercel dashboard
3. Import your GitHub repository
4. Add the environment variables above
5. Deploy!

## Migration Notes

- Changed from local JSON file to Supabase PostgreSQL database
- Converted Express server to Vercel serverless functions
- All API routes are now in `/api` directory
- Frontend remains unchanged (React + Vite)
