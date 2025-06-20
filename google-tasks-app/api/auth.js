// This file is intentionally disabled to prevent shadowing the Express /api/auth route.
// The OAuth redirect and token exchange is now handled by server.js only.
// Remove or ignore this file if not using a serverless/Vercel environment.

import { URLSearchParams } from 'url';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (!code) {
      return res.redirect(`${frontendUrl}?auth=error`);
    }
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.VITE_GOOGLE_REDIRECT_URI_API ||
      `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3001'}/api/auth`;
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
      // Optionally, handle tokens here
      return res.redirect(`${frontendUrl}?auth=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}?auth=error`);
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
