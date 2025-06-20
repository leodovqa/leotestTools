// This file is intentionally disabled to prevent shadowing the Express /api/auth route.
// The OAuth redirect and token exchange is now handled by server.js only.
// Remove or ignore this file if not using a serverless/Vercel environment.

import { URLSearchParams } from 'url';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let redirectUri =
      process.env.VITE_GOOGLE_REDIRECT_URI_API || process.env.VITE_GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
      if (process.env.VERCEL_URL) {
        redirectUri = `https://${process.env.VERCEL_URL}/api/auth`;
      } else {
        redirectUri = 'http://localhost:3001/api/auth';
      }
    }
    if (!code) {
      return res.redirect(`${frontendUrl}?auth=error`);
    }
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    try {
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      if (!response.ok) {
        return res.redirect(`${frontendUrl}?auth=error`);
      }
      const data = await response.json();
      // Fetch user profile info from Google
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const profile = await profileRes.json();
      // Store token data and profile in a cookie (stateless)
      const user = {
        ...data,
        profile,
        expires_at: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000),
      };
      res.setHeader(
        'Set-Cookie',
        `user=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`
      );
      return res.redirect(`${frontendUrl}?auth=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}?auth=error`);
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
