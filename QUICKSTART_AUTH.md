# Quick Start: Patreon Authentication

## 🚀 Get Started in 5 Minutes

### 1. Get Patreon OAuth Credentials

1. Visit [Patreon Client Portal](https://www.patreon.com/portal/registration/register-clients)
2. Click **"Create Client"**
3. Fill in basic info (name, description, etc.)
4. Add redirect URI: `http://localhost:3000/api/auth/callback/patreon`
5. Select scopes: `identity`, `identity[email]`, `identity.memberships`
6. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Your `.env.local` already has `AUTH_SECRET` set. Add your Patreon credentials:

```bash
# Already set:
AUTH_SECRET="pj2nJKHk4eJ1aSMPPWC87K9/w6DkxCOCz8hpDlu9/v4="

# Add these (replace with your actual values):
PATREON_CLIENT_ID="your-client-id-here"
PATREON_CLIENT_SECRET="your-client-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Test Authentication

1. Open `http://localhost:3000`
2. Click the **"Sign in with Patreon"** button in the navbar
3. You'll be redirected to Patreon to authorize
4. After authorization, you'll be signed in!

## ✅ What's Already Implemented

- ✅ NextAuth.js 5.0 configuration with Patreon provider
- ✅ API route handler at `/api/auth/[...nextauth]`
- ✅ Custom sign-in page at `/auth/signin`
- ✅ Custom error page at `/auth/error`
- ✅ Auth button in navbar (shows user info when logged in)
- ✅ Session provider wrapping the app
- ✅ Middleware for protected routes
- ✅ Server-side auth utilities (`getSession`, `getCurrentUser`, `isAuthenticated`)
- ✅ TypeScript types for session data
- ✅ Successful build verification

## 📁 Files Created

```
├── auth.ts                              # NextAuth config
├── middleware.ts                        # Auth middleware
├── types/next-auth.d.ts                 # TypeScript types
├── lib/auth.ts                          # Auth utilities
├── app/api/auth/[...nextauth]/route.ts  # API handler
├── app/auth/signin/page.tsx             # Sign in page
├── app/auth/error/page.tsx              # Error page
├── app/components/auth-button.tsx       # Auth button
├── app/components/session-provider.tsx  # Session wrapper
├── .env.example                         # Environment template
├── AUTH_SETUP.md                        # Detailed setup guide
└── QUICKSTART_AUTH.md                   # This file
```

## 🔐 Session Data Available

When a user is authenticated, you can access:

```typescript
{
  user: {
    id: "user-id"              // NextAuth ID
    patreonId: "patreon-id"    // Patreon user ID
    name: "User Name"          // Display name
    email: "user@example.com"  // Email address
    image: "avatar-url"        // Profile picture
  }
}
```

## 🛠️ Common Usage

### Server Component

```typescript
import { getSession } from '@/lib/auth'

export default async function Page() {
  const session = await getSession()

  if (!session) {
    return <div>Please sign in</div>
  }

  return <div>Hello, {session.user.name}!</div>
}
```

### Client Component

```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not signed in</div>

  return <div>Hello, {session.user.name}!</div>
}
```

### Protect a Route

Edit `middleware.ts`:

```typescript
const isProtectedRoute = nextUrl.pathname.startsWith("/protected") ||
                        nextUrl.pathname.startsWith("/dashboard")
```

## 🚨 Troubleshooting

**Build fails?**
```bash
pnpm build
# Check error messages for type issues
```

**Auth not working?**
1. Verify environment variables are set in `.env.local`
2. Check Patreon redirect URI matches exactly
3. Restart dev server after changing env vars

**Session not persisting?**
1. Clear browser cookies
2. Check `AUTH_SECRET` is set
3. Verify `NEXTAUTH_URL` matches your dev URL

## 📚 Need More Help?

- **Detailed Setup**: See `AUTH_SETUP.md`
- **NextAuth Docs**: https://authjs.dev
- **Patreon API**: https://docs.patreon.com

## 🎯 Next Steps

1. Get your Patreon OAuth credentials
2. Add them to `.env.local`
3. Run `pnpm dev`
4. Click "Sign in with Patreon" in the navbar
5. Start building authenticated features!

---

**Pro Tip**: For production, you'll need to:
- Create a production Patreon OAuth app (or add production redirect URI)
- Generate a new `AUTH_SECRET` for production
- Set all environment variables in your hosting platform (e.g., Vercel)
- Update `NEXTAUTH_URL` to your production domain
