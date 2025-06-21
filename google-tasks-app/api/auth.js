// This file is intentionally disabled to prevent shadowing the Express /api/auth route.
// The OAuth redirect and token exchange is now handled by server.js only.
// Remove or ignore this file if not using a serverless/Vercel environment.

import { URLSearchParams } from 'url';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, error: authError } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (authError) {
    console.error('[OAuth] Google Auth Error:', authError);
    return res.redirect(`${frontendUrl}?auth=error`);
  }

  if (!code) {
    console.error('[OAuth] No code in query params');
    return res.redirect(`${frontendUrl}?auth=error`);
  }

  const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('[OAuth] Missing Client ID, Secret, or Redirect URI');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[OAuth] Error exchanging code:', errorData);
      return res.redirect(`${frontendUrl}?auth=error`);
    }

    const tokens = await tokenResponse.json();

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    const user = {
      ...tokens,
      profile,
      expires_at: Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 3600 * 1000),
    };

    res.setHeader(
      'Set-Cookie',
      `user=${encodeURIComponent(
        JSON.stringify(user)
      )}; Path=/; HttpOnly; SameSite=None; Max-Age=3600; Secure`
    );

    return res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('[OAuth] Server error:', error);
    return res.redirect(`${frontendUrl}?auth=error`);
  }
}
