# NextAuth.js with Patreon Setup Guide

This project uses NextAuth.js 5.0 (Auth.js) with Patreon as the authentication provider.

## Prerequisites

1. A Patreon account
2. A Patreon Creator account (to create OAuth applications)

## Setup Instructions

### 1. Create a Patreon OAuth Application

1. Go to [Patreon Client Portal](https://www.patreon.com/portal/registration/register-clients)
2. Click "Create Client"
3. Fill in the application details:
   - **App Name**: Your application name (e.g., "theautist.me")
   - **Description**: Brief description of your app
   - **App Category**: Choose the appropriate category
   - **Author or Organization Name**: Your name or organization
   - **Privacy Policy URL**: Your privacy policy URL (required)
   - **Terms of Service URL**: Your terms of service URL (optional)
   - **Icon**: Upload an icon for your app (optional)

4. Set up redirect URIs:
   - **Development**: `http://localhost:3000/api/auth/callback/patreon`
   - **Production**: `https://your-domain.com/api/auth/callback/patreon`

5. Select the scopes you need:
   - ✅ `identity` - Basic user information
   - ✅ `identity[email]` - User's email address
   - ✅ `identity.memberships` - User's membership information

6. Click "Create Client"

7. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Generate a secure AUTH_SECRET
npx auth secret

# Add to .env.local:
AUTH_SECRET="generated-secret-from-above"
PATREON_CLIENT_ID="your-client-id-from-patreon"
PATREON_CLIENT_SECRET="your-client-secret-from-patreon"
NEXTAUTH_URL="http://localhost:3000"
```

**Important Security Notes:**
- Never commit `.env.local` to version control
- Use different secrets for development and production
- Rotate secrets regularly
- Store production secrets in your hosting platform's environment variables

### 3. Update Production Environment

For production deployment (e.g., Vercel):

1. Add environment variables in your hosting platform:
   - `AUTH_SECRET` - Generate a new secret for production
   - `PATREON_CLIENT_ID` - Your Patreon Client ID
   - `PATREON_CLIENT_SECRET` - Your Patreon Client Secret
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://theautist.me`)

2. Update your Patreon OAuth application redirect URIs to include production URL

### 4. Test Authentication

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign in with Patreon" in the navbar

4. You should be redirected to Patreon's OAuth flow

5. After authorization, you'll be redirected back to your site

## File Structure

```
├── auth.ts                              # NextAuth configuration
├── middleware.ts                        # Auth middleware for protected routes
├── lib/
│   └── auth.ts                         # Auth utility functions
├── types/
│   └── next-auth.d.ts                  # TypeScript type definitions
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts            # NextAuth API route handler
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx               # Sign in page
│   │   └── error/
│   │       └── page.tsx               # Error page
│   └── components/
│       ├── auth-button.tsx            # Auth button component
│       └── session-provider.tsx       # Session provider wrapper
```

## Usage

### Server Components

```typescript
import { getSession, getCurrentUser, isAuthenticated } from '@/lib/auth'

// Get full session
const session = await getSession()

// Get current user
const user = await getCurrentUser()

// Check if authenticated
const authed = await isAuthenticated()
```

### Client Components

```typescript
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <button onClick={() => signIn('patreon')}>Sign in with Patreon</button>
  )
}
```

### Protected Routes

Protected routes are handled by middleware. Update `middleware.ts` to add protected paths:

```typescript
const isProtectedRoute = nextUrl.pathname.startsWith("/protected")
```

## Session Data Structure

The session object includes:

```typescript
{
  user: {
    id: string              // User ID from NextAuth
    patreonId: string       // Patreon user ID
    name: string | null     // User's name
    email: string | null    // User's email
    image: string | null    // User's avatar
  },
  expires: string          // Session expiration timestamp
}
```

## Customization

### Adding More Scopes

To request additional Patreon data, update `auth.ts`:

```typescript
Patreon({
  clientId: process.env.PATREON_CLIENT_ID!,
  clientSecret: process.env.PATREON_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "identity identity[email] identity.memberships campaigns campaigns.members",
    },
  },
})
```

Available scopes:
- `identity` - Basic user info
- `identity[email]` - Email address
- `identity.memberships` - Membership info
- `campaigns` - Campaign data
- `campaigns.members` - Campaign member data
- `campaigns.posts` - Campaign posts

### Custom Callbacks

The `auth.ts` file includes JWT and session callbacks. Modify these to add custom logic:

```typescript
callbacks: {
  async jwt({ token, account, profile }) {
    // Add custom data to token
    if (account) {
      token.customField = "custom value"
    }
    return token
  },
  async session({ session, token }) {
    // Add custom data to session
    if (session.user) {
      session.user.customField = token.customField
    }
    return session
  },
}
```

## Troubleshooting

### Common Issues

1. **"Configuration" Error**
   - Check that all environment variables are set correctly
   - Verify `AUTH_SECRET` is generated and set

2. **"Callback URL Mismatch"**
   - Ensure redirect URI in Patreon matches exactly: `http://localhost:3000/api/auth/callback/patreon`
   - Check `NEXTAUTH_URL` is set correctly

3. **"Invalid Client" Error**
   - Verify `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET` are correct
   - Check that your Patreon OAuth app is active

4. **Session Not Persisting**
   - Clear browser cookies and try again
   - Check that `AUTH_SECRET` is set and not changing between requests

5. **TypeScript Errors**
   - Run `pnpm build` to check for type errors
   - Ensure `types/next-auth.d.ts` is in your project

### Debug Mode

Enable NextAuth debug mode by adding to `.env.local`:

```bash
NEXTAUTH_DEBUG=true
```

This will provide detailed logs in your terminal.

## Security Best Practices

1. **Secret Management**
   - Never commit secrets to version control
   - Use different secrets for each environment
   - Rotate secrets regularly
   - Use strong, randomly generated secrets

2. **HTTPS in Production**
   - Always use HTTPS in production
   - Set `NEXTAUTH_URL` to your HTTPS URL

3. **Cookie Security**
   - NextAuth automatically sets secure cookies in production
   - Cookies are HTTP-only and same-site strict

4. **Rate Limiting**
   - Consider adding rate limiting to auth endpoints
   - Implement brute force protection

5. **Session Duration**
   - Adjust session duration based on your security requirements
   - Consider implementing refresh tokens for long sessions

## Resources

- [NextAuth.js Documentation](https://authjs.dev)
- [Patreon API Documentation](https://docs.patreon.com)
- [OAuth 2.0 Specification](https://oauth.net/2/)
